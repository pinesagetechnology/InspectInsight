import { genAIService } from './genAIService';
import { webllmService } from './webllm';
import { modelManager } from './modelManager';
import { AIBaseServiceAdapter } from './aiBaseServiceAdapter';
import { AIResponse, Message } from '../models/webllm';
import { InspectionReport } from '../entities/genAIModel';

class AISummaryServiceAdapter extends AIBaseServiceAdapter {

    async sendGetCompletion(inspectionContext: any, previousInspectionJson: any): Promise<AIResponse> {
        try {
            if (this.currentSource === 'local') {
                return await this.sendLocalGetCompletion(inspectionContext, previousInspectionJson);
            } else {
                return await this.sendOnlineGetCompletion(inspectionContext, previousInspectionJson);
            }
        } catch (error) {
            console.error('Error sending chat message:', error);
            throw error;
        }
    }

    private async sendLocalGetCompletion(inspectionContext: any, previousInspectionJson: any): Promise<AIResponse> {
        // Check if local AI is available
        const isAvailable = await this.isLocalAvailable();
        if (!isAvailable) {
            throw new Error('Local AI is not available. Please check WebGPU support and model status.');
        }

        try {
            // Optimize context data to reduce token usage
            const optimizedCurrentInspection = inspectionContext;
            const optimizedPreviousInspection = previousInspectionJson ? previousInspectionJson : null;

            // Create context object and convert to string for parsing
            const contextObj = {
                currentInspection: optimizedCurrentInspection,
                previousInspection: optimizedPreviousInspection
            };
            const contextString = JSON.stringify(contextObj);

            // Create a simple message for WebLLM
            const messages: Message[] = [{
                id: Date.now().toString(),
                role: 'user',
                content: `${contextString}`,
                timestamp: new Date()
            }];

            // Get current model name
            const currentModel = modelManager.getCurrentModel();
            const modelName = modelManager.getModel(currentModel || '')?.displayName || currentModel || 'Unknown';

            // Generate response using WebLLM
            const response = await webllmService.generateResponse(messages, '', false);

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

    private async sendOnlineGetCompletion(inspectionContext: any, previousInspectionJson: any): Promise<AIResponse> {
        // Check if online AI is available
        const isAvailable = await this.isOnlineAvailable();
        if (!isAvailable) {
            throw new Error('Online AI is not available. Please check your internet connection and authentication.');
        }

        try {
            const requestBody = {
                contextJson: JSON.stringify(inspectionContext),
                previousInspectionJson: JSON.stringify(previousInspectionJson)
            };

            const result: InspectionReport = await genAIService.getCompletion(requestBody);

            return {
                response: result.response,
                source: 'online',
                modelName: ''
            };
        } catch (error) {
            console.error('Error with online AI:', error);
            throw new Error(`Online AI error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

}

export const aiSummaryServiceAdapter = new AISummaryServiceAdapter(); 