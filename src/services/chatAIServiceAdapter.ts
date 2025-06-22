import { genAIService } from './genAIService';
import { webllmService } from './webllm';
import { modelManager } from './modelManager';
import { AIResponse, Message } from '../models/webllm';
import { AIBaseServiceAdapter } from './aiBaseServiceAdapter';

class ChatAIServiceAdapter extends AIBaseServiceAdapter {

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
            const response = await webllmService.generateResponse(messages, '', true);

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
}

export const chatAIServiceAdapter = new ChatAIServiceAdapter(); 