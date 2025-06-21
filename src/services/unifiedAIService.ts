import { genAIService } from './genAIService';
import { webllmService } from './webllm';
import { modelManager } from './modelManager';
import { Message } from '../models/webllm';

export type AISource = 'local' | 'online';

export interface AIResponse {
    response: string;
    source: AISource;
    modelName?: string;
}

class UnifiedAIService {
    private currentSource: AISource = 'online'; // Default to online

    /**
     * Set the AI source (local or online)
     */
    setSource(source: AISource): void {
        this.currentSource = source;
    }

    /**
     * Get the current AI source
     */
    getSource(): AISource {
        return this.currentSource;
    }

    /**
     * Check if local AI is available (WebGPU + model ready)
     */
    async isLocalAvailable(): Promise<boolean> {
        try {
            const webGPUSupported = await webllmService.checkWebGPUSupport();
            if (!webGPUSupported) {
                return false;
            }

            const currentModel = modelManager.getCurrentModel();
            if (!currentModel) {
                return false;
            }

            return webllmService.isReady();
        } catch (error) {
            console.error('Error checking local AI availability:', error);
            return false;
        }
    }

    /**
     * Check if online AI is available (network + auth)
     */
    async isOnlineAvailable(): Promise<boolean> {
        try {
            // Check if we have a valid token
            const token = localStorage.getItem('token');
            if (!token) {
                return false;
            }

            // Check network connectivity
            return navigator.onLine;
        } catch (error) {
            console.error('Error checking online AI availability:', error);
            return false;
        }
    }

    /**
     * Send a chat message using the selected AI source
     */
    async sendChatMessage(prompt: string, contextJson: string): Promise<AIResponse> {
        try {
            if (this.currentSource === 'local') {
                return await this.sendLocalMessage(prompt, contextJson);
            } else {
                return await this.sendOnlineMessage(prompt, contextJson);
            }
        } catch (error) {
            console.error('Error sending chat message:', error);
            throw error;
        }
    }

    /**
     * Send message using local WebLLM
     */
    private async sendLocalMessage(prompt: string, contextJson: string): Promise<AIResponse> {
        // Check if local AI is available
        const isAvailable = await this.isLocalAvailable();
        if (!isAvailable) {
            throw new Error('Local AI is not available. Please check WebGPU support and model status.');
        }

        try {
            // Parse context and create messages for WebLLM
            const context = JSON.parse(contextJson);
            const messages: Message[] = context.map((msg: any) => ({
                id: Date.now().toString() + Math.random(),
                role: msg.role,
                content: msg.content,
                timestamp: new Date()
            }));

            // Add the current prompt
            messages.push({
                id: Date.now().toString() + Math.random(),
                role: 'user',
                content: prompt,
                timestamp: new Date()
            });

            // Get current model name
            const currentModel = modelManager.getCurrentModel();
            const modelName = modelManager.getModel(currentModel || '')?.displayName || currentModel || 'Unknown';

            // Generate response using WebLLM
            const response = await webllmService.generateResponse(messages, '');

            return {
                response,
                source: 'local',
                modelName
            };
        } catch (error) {
            console.error('Error with local AI:', error);
            throw new Error(`Local AI error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Send message using online Azure AI
     */
    private async sendOnlineMessage(prompt: string, contextJson: string): Promise<AIResponse> {
        // Check if online AI is available
        const isAvailable = await this.isOnlineAvailable();
        if (!isAvailable) {
            throw new Error('Online AI is not available. Please check your internet connection and authentication.');
        }

        try {
            // Use the existing genAIService
            const result = await genAIService.sendChatMessage(prompt, contextJson);

            return {
                response: result.response,
                source: 'online',
                modelName: 'Azure OpenAI'
            };
        } catch (error) {
            console.error('Error with online AI:', error);
            throw new Error(`Online AI error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get status information about both AI sources
     */
    async getStatus(): Promise<{
        local: {
            available: boolean;
            modelName?: string;
            webGPUSupported: boolean;
        };
        online: {
            available: boolean;
            authenticated: boolean;
        };
    }> {
        const [localAvailable, onlineAvailable] = await Promise.all([
            this.isLocalAvailable(),
            this.isOnlineAvailable()
        ]);

        const currentModel = modelManager.getCurrentModel();
        const modelName = currentModel ? modelManager.getModel(currentModel)?.displayName : undefined;
        const webGPUSupported = await webllmService.checkWebGPUSupport();
        const token = localStorage.getItem('token');

        return {
            local: {
                available: localAvailable,
                modelName,
                webGPUSupported
            },
            online: {
                available: onlineAvailable,
                authenticated: !!token
            }
        };
    }
}

export const unifiedAIService = new UnifiedAIService(); 