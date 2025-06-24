// src/services/webllm.ts
import * as webllm from "@mlc-ai/web-llm";
import { AIServiceInterface, Message, WebLLMProgress } from '../models/webllm';
import { aiStorageService } from '../helper/aiDb';

class WebLLMService implements AIServiceInterface {
    private engine: webllm.MLCEngine | null = null;
    private currentModelId: string | null = null;
    private isInitializing = false;
    private customModels: Array<{model_id: string, model_url: string, display_name: string, size: string}> = [];

    // Add method to register custom models
    registerCustomModel(modelConfig: {
        model_id: string;
        model_url: string;
        display_name: string;
        size: string;
    }): void {
        try {
            console.log(`Attempting to register custom model: ${modelConfig.model_id}`);
            console.log('Model URL:', modelConfig.model_url);
            console.log('Current WebLLM model list length:', webllm.prebuiltAppConfig.model_list.length);
            
            // Validate URLs
            try {
                new URL(modelConfig.model_url);
                console.log('✅ Model URL is valid');
            } catch (urlError) {
                console.error('❌ Invalid model URL:', modelConfig.model_url);
                throw new Error(`Invalid model URL: ${modelConfig.model_url}`);
            }
            
            // Check if model already exists in our custom models
            const existingIndex = this.customModels.findIndex(m => m.model_id === modelConfig.model_id);
            if (existingIndex >= 0) {
                this.customModels[existingIndex] = modelConfig;
            } else {
                this.customModels.push(modelConfig);
            }

            // Add to WebLLM's prebuiltAppConfig.model_list
            const webllmModelConfig = {
                model_id: modelConfig.model_id,
                model_url: modelConfig.model_url,
                model_lib_url: modelConfig.model_url, // Use the same URL for model_lib
                display_name: modelConfig.display_name,
                size: modelConfig.size,
                model: modelConfig.model_id,
                model_lib: modelConfig.model_id
            };

            console.log('WebLLM model config to add:', webllmModelConfig);

            // Check if model already exists in WebLLM config
            const existingWebLLMIndex = webllm.prebuiltAppConfig.model_list.findIndex(
                m => m.model_id === modelConfig.model_id
            );

            if (existingWebLLMIndex >= 0) {
                // Update existing entry
                webllm.prebuiltAppConfig.model_list[existingWebLLMIndex] = webllmModelConfig;
                console.log(`Updated existing model at index ${existingWebLLMIndex}`);
            } else {
                // Add new entry
                webllm.prebuiltAppConfig.model_list.push(webllmModelConfig);
                console.log(`Added new model at index ${webllm.prebuiltAppConfig.model_list.length - 1}`);
            }

            console.log(`✅ Registered custom model: ${modelConfig.model_id}`);
            console.log('Updated WebLLM model list length:', webllm.prebuiltAppConfig.model_list.length);
        } catch (error) {
            console.error(`❌ Failed to register custom model ${modelConfig.model_id}:`, error);
            throw error;
        }
    }

    // Add method to register multiple custom models
    registerCustomModels(modelConfigs: Array<{
        model_id: string;
        model_url: string;
        display_name: string;
        size: string;
    }>): void {
        modelConfigs.forEach(config => this.registerCustomModel(config));
    }

    async checkWebGPUSupport(): Promise<boolean> {
        try {
            if (!(navigator as any).gpu) {
                console.warn('WebGPU not available in this browser');
                return false;
            }

            const adapter = await (navigator as any).gpu.requestAdapter();
            if (!adapter) {
                console.warn('No WebGPU adapter found');
                return false;
            }

            return true;
        } catch (error) {
            console.error('WebGPU support check failed:', error);
            return false;
        }
    }

    async initialize(modelId: string, onProgress?: (progress: WebLLMProgress) => void): Promise<void> {
        if (this.isInitializing) {
            throw new Error('Model initialization already in progress');
        }

        if (this.currentModelId === modelId && this.engine) {
            console.log(`Model ${modelId} already initialized`);
            return;
        }

        const isSupported = await this.checkWebGPUSupport();
        if (!isSupported) {
            throw new Error('WebGPU is not supported in this browser. Please use Chrome 113+ or Edge 113+');
        }

        this.isInitializing = true;

        try {
            console.log(`Initializing model: ${modelId}`);

            // Cleanup previous engine if exists
            if (this.engine) {
                await this.engine.unload();
                this.engine = null;
            }
            
            // Initialize new engine with progress tracking
            this.engine = await webllm.CreateMLCEngine(modelId, {
                initProgressCallback: (progress) => {
                    const progressInfo: WebLLMProgress = {
                        progress: progress.progress * 100,
                        text: progress.text || `Loading ${modelId}...`,
                        timeElapsed: progress.timeElapsed || 0
                    };
                    onProgress?.(progressInfo);
                },
                logLevel: "INFO"
            });

            this.currentModelId = modelId;
            await aiStorageService.saveModelState(modelId, true);

            console.log(`Successfully initialized model: ${modelId}`);
        } catch (error) {
            console.error(`Failed to initialize model ${modelId}:`, error);
            throw new Error(`Model initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            this.isInitializing = false;
        }
    }

    async switchModel(modelId: string, onProgress?: (progress: WebLLMProgress) => void): Promise<void> {
        if (this.currentModelId === modelId && this.engine) {
            console.log(`Already using model: ${modelId}`);
            return;
        }

        const isDownloaded = await aiStorageService.loadModelState(modelId);
        if (!isDownloaded) {
            throw new Error(`Model ${modelId} is not downloaded. Please download it first.`);
        }

        await this.initialize(modelId, onProgress);
    }

    async generateResponse(messages: Message[], guidelines: string, isChat: boolean): Promise<string> {
        if (!this.engine) {
            throw new Error('Model not initialized. Please initialize a model first.');
        }

        if (this.isInitializing) {
            throw new Error('Model is still initializing. Please wait...');
        }

        try {
            const formattedMessages = this.formatMessages(messages, guidelines, isChat);

            console.log('Generating response with messages:', formattedMessages);

            // Better token estimation: 1 token ≈ 3.5 characters for English text
            const totalContentLength = formattedMessages.reduce((acc, msg) => acc + (msg.content?.length || 0), 0);
            const estimatedTokens = Math.ceil(totalContentLength / 3.5); // More accurate estimation
            const contextWindow = this.getModelContextWindow();

            console.log(`Estimated tokens: ${estimatedTokens}, Context window: ${contextWindow}`);

            // Use a threshold that leaves room for response tokens
            const chunkingThreshold = Math.floor(contextWindow * 0.85); // Use 85% of context window
            
            if (estimatedTokens > chunkingThreshold) {
                console.warn(`Large context detected (estimated ${estimatedTokens} tokens). Using chunking strategy.`);
                return await this.generateResponseWithChunking(formattedMessages);
            }

            const response = await this.engine.chat.completions.create({
                messages: formattedMessages,
                temperature: 0.7,
                max_tokens: 1024,
                stream: false
            });

            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No response generated from the model');
            }

            return content;
        } catch (error) {
            console.error('Response generation failed:', error);
            throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async generateResponseWithChunking(messages: webllm.ChatCompletionMessageParam[]): Promise<string> {
        if (!this.engine) {
            throw new Error('Model not initialized');
        }

        try {
            // Find the system message and user message
            const systemMessage = messages.find(msg => msg.role === 'system');
            const userMessage = messages.find(msg => msg.role === 'user');
            
            if (!userMessage || !userMessage.content) {
                throw new Error('No user message found for chunking');
            }

            const userContent = typeof userMessage.content === 'string' ? userMessage.content : JSON.stringify(userMessage.content);
            
            // Calculate how much space we have for user content - be more conservative
            const contextWindow = this.getModelContextWindow();
            const systemMessageTokens = systemMessage ? Math.ceil(systemMessage.content.length / 3.5) : 0;
            const reservedTokens = 1000; // More reserved tokens for safety
            const maxUserContentTokens = Math.floor((contextWindow - systemMessageTokens - reservedTokens) * 0.8); // Use only 80% of available space
            const maxUserContentChars = Math.floor(maxUserContentTokens * 3.5); // Convert back to characters
            
            console.log(`Chunking user content. Context window: ${contextWindow}, System tokens: ${systemMessageTokens}, Max user chars per chunk: ${maxUserContentChars}`);
            
            // Chunk the user content
            const chunks = this.chunkContent(userContent, maxUserContentChars);
            console.log(`Split user content into ${chunks.length} chunks`);

            let fullResponse = '';
            
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                const isLastChunk = i === chunks.length - 1;
                
                // Create messages for this chunk
                const chunkMessages: webllm.ChatCompletionMessageParam[] = [];
                
                // Add system message (shortened for intermediate chunks)
                if (systemMessage) {
                    const systemContent = isLastChunk ? 
                        systemMessage.content : 
                        'You are a bridge inspection assistant. Analyze the provided data and provide insights.';
                    
                    chunkMessages.push({
                        role: 'system',
                        content: systemContent
                    });
                }
                
                // Add user message for this chunk
                chunkMessages.push({
                    role: 'user',
                    content: isLastChunk ? 
                        `Final part ${i + 1} of ${chunks.length}: ${chunk}\n\nPlease provide a comprehensive analysis based on all the data provided.` :
                        `Part ${i + 1} of ${chunks.length}: ${chunk}\n\nThis is part of a larger dataset. Please acknowledge receipt and wait for the complete data.`
                });

                console.log(`Processing chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);

                // Debug: Calculate actual tokens for this chunk
                const chunkMessagesLength = chunkMessages.reduce((acc, msg) => acc + (msg.content?.length || 0), 0);
                const estimatedChunkTokens = Math.ceil(chunkMessagesLength / 3.5);
                console.log(`Chunk ${i + 1} estimated tokens: ${estimatedChunkTokens} (should be < ${contextWindow})`);

                // Safety check: if chunk is still too large, skip it and log warning
                if (estimatedChunkTokens >= contextWindow) {
                    console.warn(`Chunk ${i + 1} is too large (${estimatedChunkTokens} tokens), skipping...`);
                    continue;
                }

                const response = await this.engine.chat.completions.create({
                    messages: chunkMessages,
                    temperature: 0.7,
                    max_tokens: isLastChunk ? 1024 : 100, // Very short responses for intermediate chunks
                    stream: false
                });

                const responseContent = response.choices[0]?.message?.content;
                if (responseContent) {
                    if (isLastChunk) {
                        fullResponse = responseContent;
                        console.log(`Final response generated (${responseContent.length} chars)`);
                    } else {
                        console.log(`Chunk ${i + 1} processed successfully`);
                    }
                }
            }

            return fullResponse;
        } catch (error) {
            console.error('Chunked response generation failed:', error);
            throw new Error(`Failed to generate chunked response: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private chunkContent(content: string, maxChunkSize: number): string[] {
        const chunks: string[] = [];
        
        // If content is already small enough, return it as a single chunk
        if (content.length <= maxChunkSize) {
            return [content];
        }
        
        console.log(`Chunking content of ${content.length} characters into chunks of max ${maxChunkSize} characters`);
        
        // Try to split by JSON objects first (for structured data)
        const jsonMatches = content.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
        
        if (jsonMatches && jsonMatches.length > 1) {
            console.log(`Found ${jsonMatches.length} JSON objects, chunking by JSON`);
            let currentChunk = '';
            
            for (const jsonObj of jsonMatches) {
                // If adding this JSON object would exceed the limit
                if (currentChunk.length + jsonObj.length + 1 > maxChunkSize) {
                    if (currentChunk) {
                        chunks.push(currentChunk.trim());
                        currentChunk = '';
                    }
                    
                    // If a single JSON object is too large, split it more aggressively
                    if (jsonObj.length > maxChunkSize) {
                        console.warn(`Large JSON object (${jsonObj.length} chars), splitting it aggressively`);
                        const subChunks = this.splitLargeJSON(jsonObj, maxChunkSize);
                        chunks.push(...subChunks);
                    } else {
                        currentChunk = jsonObj;
                    }
                } else {
                    currentChunk += (currentChunk ? '\n' : '') + jsonObj;
                }
            }
            
            if (currentChunk.trim()) {
                chunks.push(currentChunk.trim());
            }
        } else {
            // Fallback to simple text-based chunking
            console.log('Using text-based chunking');
            chunks.push(...this.splitLargeText(content, maxChunkSize));
        }
        
        console.log(`Created ${chunks.length} chunks`);
        return chunks;
    }
    
    private splitLargeJSON(jsonStr: string, maxChunkSize: number): string[] {
        const chunks: string[] = [];
        
        // Try to split by top-level properties first
        const propertyMatches = jsonStr.match(/"([^"]+)":\s*(?:\{[^{}]*\}|\[[^\[\]]*\]|"[^"]*"|true|false|null|\d+)/g);
        
        if (propertyMatches && propertyMatches.length > 1) {
            console.log(`Splitting JSON by ${propertyMatches.length} properties`);
            let currentChunk = '{';
            let isFirstProperty = true;
            
            for (const property of propertyMatches) {
                if (currentChunk.length + property.length + 1 > maxChunkSize) {
                    if (currentChunk !== '{') {
                        currentChunk += '}';
                        chunks.push(currentChunk);
                        currentChunk = '{';
                        isFirstProperty = true;
                    }
                    
                    // If a single property is too large, split it further
                    if (property.length > maxChunkSize) {
                        console.warn(`Large property (${property.length} chars), splitting it`);
                        const subChunks = this.splitLargeText(property, maxChunkSize);
                        chunks.push(...subChunks);
                    } else {
                        currentChunk += property;
                        isFirstProperty = false;
                    }
                } else {
                    if (!isFirstProperty) {
                        currentChunk += ',';
                    }
                    currentChunk += property;
                    isFirstProperty = false;
                }
            }
            
            if (currentChunk !== '{') {
                currentChunk += '}';
                chunks.push(currentChunk);
            }
        } else {
            // Fallback to character-based splitting
            console.log('Falling back to character-based JSON splitting');
            for (let i = 0; i < jsonStr.length; i += maxChunkSize) {
                chunks.push(jsonStr.substring(i, i + maxChunkSize));
            }
        }
        
        return chunks;
    }

    private splitLargeText(text: string, maxChunkSize: number): string[] {
        const chunks: string[] = [];
        let currentChunk = '';
        
        // Split by sentences first, then by words
        const sentences = text.split(/(?<=[.!?])\s+/);
        
        for (const sentence of sentences) {
            if (currentChunk.length + sentence.length + 1 <= maxChunkSize) {
                currentChunk += (currentChunk ? ' ' : '') + sentence;
            } else {
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                    currentChunk = '';
                }
                
                // If a single sentence is too large, split by words
                if (sentence.length > maxChunkSize) {
                    const words = sentence.split(' ');
                    for (const word of words) {
                        if (currentChunk.length + word.length + 1 <= maxChunkSize) {
                            currentChunk += (currentChunk ? ' ' : '') + word;
                        } else {
                            if (currentChunk) {
                                chunks.push(currentChunk.trim());
                                currentChunk = '';
                            }
                            // If a single word is too large, split it
                            if (word.length > maxChunkSize) {
                                console.warn(`Very large word (${word.length} chars), splitting it`);
                                for (let i = 0; i < word.length; i += maxChunkSize) {
                                    chunks.push(word.substring(i, i + maxChunkSize));
                                }
                            } else {
                                currentChunk = word;
                            }
                        }
                    }
                } else {
                    currentChunk = sentence;
                }
            }
        }
        
        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }
        
        return chunks;
    }

    private formatMessages(messages: Message[], guidelines: string, isChat: boolean): webllm.ChatCompletionMessageParam[] {
        const formattedMessages: webllm.ChatCompletionMessageParam[] = [];

        // Add system message with guidelines
        const systemContent = isChat ?
            ` You are an experinced bridge inspector and act as an assitant purly based on bridge inspection manual prcedure (REFERENCE_MANUAL). 
            If you don't find the answer based on this document , politly say that.
            No greeting are required. alos avoid any duplications. suggest follow on questions based on the contenxt.

            REFERENCE_MANUAL: ${guidelines}

            Use the correct terminology and naming conventions exactly as defined in the RTA Bridge Inspection Manual (REFERENCE_MANUAL) and TfNSW specifications. Where applicable, refer to:

            Element names (e.g., "Steel I-Girder", "Bearings – Elastomeric")
            Defect types (e.g., "Corrosion – Moderate", "Spalling – Severe")
            Condition states (e.g., CS1 to CS4)
            Relevant actions (e.g., routine maintenance, detailed inspection, structural assessment)

            If the question relates to past inspection records, compare changes between current inspection and previous inspection and suggest possible deterioration patterns.
            If asked for procedures or definitions, refer directly to the manuals and standards, ensuring responses are authoritative and standards-based.

            Sample queries users may ask:
            "What's the standard condition state for rust on a steel truss?"
            "Compare the 2021 and 2024 inspection findings for this bridge"
            "What action is required for severe delamination on a deck soffit?"
            "Summarise the last inspection and highlight key issues"
            "Explain the inspection frequency for timber bridges under TfNSW guidelines"
            
            Use structured responses with headings where needed (e.g., Affected Element, Condition State, Action Required)

            Provide citations to source documents where applicable (e.g., Ref: TfNSW Bridge Inspection Manual Section 6.2.4)`
            :
            ` You are a specialized bridge inspection analysis system. 
            Your task is to analyze the provided bridge inspection JSON data and summarize the findings according to the standards in the reference manual.

            REFERENCE_MANUAL: ${guidelines}

            Using the provided bridge inspection data (Bridge Elements Form and Bridge Inspection Report Form), generate an executive summary report structured as follows:

            Bridge Identification and Inspection Details
            Bridge Name and Description

            Date of Current Inspection and Previous Inspection(s)

            Inspection Type (e.g. Normal, Underwater, Test Bore)

            Inspection Equipment Used

            General Summary of Current Bridge Condition
            Provide a high-level summary of the overall structural condition based on the Element Health Ratings and distribution across Condition States. 
            Indicate any structural systems performing well or showing early signs of deterioration. Highlight environmental categories assigned (e.g. L, M, S).
            Only Report on the elements which have condition rating (conditionRatings in the json context) assigned by inspector in the current inspection. Do not generalize.
            Use Australian English spelling and terminology throughout the report.
            Do not conclude unless all elements have condition rating assigned to them. Refer to 'inspectionRatingProgress' in JSON Inspection data.
            Only summerize the trend for the elements condition rating 3 or 4.

            Changes from Previous Inspections
            Generate a clear comparison of bridge element performance since the last inspection using:

            Element Code and Description

            Change in Element Condition Index (ECI)

            Movement between Condition States (1–5)

            Notable trends (e.g., improvement due to maintenance or degradation due to exposure)
            Present this in table or bullet format where appropriate.

            Required Maintenance Actions
            Based on the updated Condition Rating of Elements and comments from the Bridge Inspection Report:

            List each element requiring maintenance with the Element Code

            Include the Activity Number and Description (as per Bridge Activity List in Appendix A)

            Record estimated Quantity, Unit, and Proposed Date for Completion

            Include specific location on structure (e.g., "upstream girder, span 2")

            Inspector's Comments
            Summarise:

            Observations from the bridge site related to access, visibility, or limitations

            Any issues with data accuracy or legacy records in BIS

            Notes on condition trends, equipment used, or complexity of structure

            Confirmation of whether all relevant fields have been completed according to the manual`;

        formattedMessages.push({
            role: 'system',
            content: systemContent
        });

        // Add conversation history (exclude system messages from UI)
        messages
            .filter(msg => msg.role !== 'system')
            .forEach(msg => {
                formattedMessages.push({
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content
                });
            });

        return formattedMessages;
    }

    async generateStreamResponse(
        messages: Message[],
        guidelines: string,
        onChunk: (chunk: string) => void,
        isChat: boolean
    ): Promise<void> {
        if (!this.engine) {
            throw new Error('Model not initialized');
        }

        try {
            const formattedMessages = this.formatMessages(messages, guidelines, isChat);

            const stream = await this.engine.chat.completions.create({
                messages: formattedMessages,
                temperature: 0.7,
                max_tokens: 1024,
                stream: true
            });

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                    onChunk(content);
                }
            }
        } catch (error) {
            console.error('Streaming response failed:', error);
            throw new Error(`Failed to generate streaming response: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    isReady(): boolean {
        return this.engine !== null && !this.isInitializing;
    }

    getCurrentModel(): string | null {
        return this.currentModelId;
    }

    async resetChat(): Promise<void> {
        if (this.engine) {
            try {
                await this.engine.resetChat();
                console.log('Chat history reset');
            } catch (error) {
                console.warn('Failed to reset chat:', error);
            }
        }
    }

    async getModelInfo(): Promise<string> {
        if (!this.engine) {
            return 'No model loaded';
        }

        try {
            const stats = await this.engine.runtimeStatsText();
            return stats;
        } catch (error) {
            return `Model: ${this.currentModelId} (Runtime stats unavailable)`;
        }
    }

    async unload(): Promise<void> {
        if (this.engine) {
            try {
                await this.engine.unload();
                this.engine = null;
                this.currentModelId = null;
                console.log('Model unloaded');
            } catch (error) {
                console.error('Failed to unload model:', error);
            }
        }
    }

    // Add method to get custom model information
    getCustomModelInfo(modelId: string): {model_id: string, model_url: string, display_name: string, size: string} | undefined {
        return this.customModels.find(m => m.model_id === modelId);
    }

    // Add method to get all custom models
    getCustomModels(): Array<{model_id: string, model_url: string, display_name: string, size: string}> {
        return [...this.customModels];
    }

    getAvailableModels(): string[] {
        try {
            const builtInModels = webllm.prebuiltAppConfig.model_list.map(model => model.model_id);
            const customModelIds = this.customModels.map(model => model.model_id);
            return [...builtInModels, ...customModelIds];
        } catch (error) {
            console.warn('Could not get model list from WebLLM:', error);
            // Fallback list of known working models
            const fallbackModels = [
                'Llama-3.2-1B-Instruct-q4f32_1-MLC',
                'Llama-3.2-3B-Instruct-q4f32_1-MLC',
                'Llama-2-7b-chat-hf-q4f16_1-MLC',
                'Mistral-7B-Instruct-v0.2-q4f16_1-MLC'
            ];
            const customModelIds = this.customModels.map(model => model.model_id);
            return [...fallbackModels, ...customModelIds];
        }
    }

    // Add method to get model context window size
    getModelContextWindow(): number {
        // Default context window for most models
        const defaultContextWindow = 4096;
        
        // Some models have different context windows
        const contextWindows: { [key: string]: number } = {
            'Llama-3.1-8B-Instruct-q4f32_1-MLC-1k': 8192,
            'Llama-3.1-8B-Instruct-q4f16_1-MLC-1k': 8192,
            'Llama-3-8B-Instruct-q4f32_1-MLC-1k': 8192,
            'Llama-3-8B-Instruct-q4f16_1-MLC-1k': 8192,
            'Llama-2-7b-chat-hf-q4f32_1-MLC-1k': 8192,
            'Llama-2-7b-chat-hf-q4f16_1-MLC-1k': 8192,
            'Phi-3.5-mini-instruct-q4f16_1-MLC-1k': 8192,
            'Phi-3.5-mini-instruct-q4f32_1-MLC-1k': 8192,
            'gemma-2-2b-it-q4f16_1-MLC-1k': 8192,
            'gemma-2-2b-it-q4f32_1-MLC-1k': 8192,
            'stablelm-2-zephyr-1_6b-q4f16_1-MLC-1k': 8192,
            'stablelm-2-zephyr-1_6b-q4f32_1-MLC-1k': 8192,
            'RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC-1k': 8192,
            'RedPajama-INCITE-Chat-3B-v1-q4f32_1-MLC-1k': 8192,
            'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC-1k': 8192,
            'TinyLlama-1.1B-Chat-v1.0-q4f32_1-MLC-1k': 8192,
            'Phi-3-mini-4k-instruct-q4f16_1-MLC-1k': 8192,
            'Phi-3-mini-4k-instruct-q4f32_1-MLC-1k': 8192,
            'TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC-1k': 8192,
            'TinyLlama-1.1B-Chat-v0.4-q4f32_1-MLC-1k': 8192
        };
        
        return contextWindows[this.currentModelId || ''] || defaultContextWindow;
    }
}

export const webllmService = new WebLLMService();