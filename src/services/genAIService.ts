import { ChatRequest } from 'entities/genAIModel';
import { setUpgenAIAPIEnv } from '../configuration';
import { setAuthorize } from '../helper/genAPI';

class GenAIService {
    
    constructor() {
        setUpgenAIAPIEnv();
    }

    private readonly baseUrl = window.GEN_API_URL;

    public async getCompletion(contextJson: string): Promise<string> {
        await setAuthorize();

        try {
            const response = await fetch(`${this.baseUrl}api/GenAI/completion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
                body: JSON.stringify(contextJson)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`GenAI API error: ${response.status} - ${errorText}`);
            }

            // Assuming the API returns just a string response
            const result = await response.text();
            return result;
        } catch (error) {
            console.error('Error calling GenAI completion API:', error);
            throw new Error('Failed to generate AI completion. Please try again.');
        }
    }

    /**
     * Send chat message to AI (used by chat interface)
     */
    public async sendChatMessage(prompt: string, contextJson: string): Promise<string> {
        await setAuthorize();

        try {
            const request: ChatRequest = {
                prompt,
                contextJson
            };

            const response = await fetch(`${this.baseUrl}/api/GenAI/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
                body: JSON.stringify(request)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`GenAI Chat API error: ${response.status} - ${errorText}`);
            }

            // Assuming the API returns just a string response
            const result = await response.text();
            return result;
        } catch (error) {
            console.error('Error calling GenAI chat API:', error);
            throw new Error('Failed to send message. Please try again.');
        }
    }
}

export const genAIService = new GenAIService();