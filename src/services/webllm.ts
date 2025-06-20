// src/services/webllm.ts
import * as webllm from "@mlc-ai/web-llm";
import { AIServiceInterface, Message, WebLLMProgress } from '../models/webllm';
import { aiStorageService } from '../helper/aiDb';

class WebLLMService implements AIServiceInterface {
    private engine: webllm.MLCEngine | null = null;
    private currentModelId: string | null = null;
    private isInitializing = false;

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

    async generateResponse(messages: Message[], guidelines: string): Promise<string> {
        if (!this.engine) {
            throw new Error('Model not initialized. Please initialize a model first.');
        }

        if (this.isInitializing) {
            throw new Error('Model is still initializing. Please wait...');
        }

        try {
            const formattedMessages = this.formatMessages(messages, guidelines);

            console.log('Generating response with messages:', formattedMessages);

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

    private formatMessages(messages: Message[], guidelines: string): webllm.ChatCompletionMessageParam[] {
        const formattedMessages: webllm.ChatCompletionMessageParam[] = [];

        // Add system message with guidelines
        const systemContent = guidelines
            ? `You are a helpful AI assistant. Please follow these guidelines: ${guidelines}`
            : 'You are a helpful AI assistant running locally in the browser.';

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
        onChunk: (chunk: string) => void
    ): Promise<void> {
        if (!this.engine) {
            throw new Error('Model not initialized');
        }

        try {
            const formattedMessages = this.formatMessages(messages, guidelines);

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

    getAvailableModels(): string[] {
        try {
            return webllm.prebuiltAppConfig.model_list.map(model => model.model_id);
        } catch (error) {
            console.warn('Could not get model list from WebLLM:', error);
            // Fallback list of known working models
            return [
                'SmolLM-1.7B-Instruct-q4f16_1-MLC',
                'Phi-3.5-mini-instruct-q4f16_1-MLC',
                'Llama-3.2-1B-Instruct-q4f32_1-MLC',
                'Llama-3.2-3B-Instruct-q4f32_1-MLC'
            ];
        }
    }
}

export const webllmService = new WebLLMService();