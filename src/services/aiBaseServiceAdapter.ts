import { webllmService } from './webllm';
import { modelManager } from './modelManager';
import { AISource, AISourceStatus } from '../models/webllm';

export class AIBaseServiceAdapter {
    protected currentSource: AISource = 'online'; // Default to online

    setSource(source: AISource): void {
        this.currentSource = source;
    }

    getSource(): AISource {
        return this.currentSource;
    }

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

    async isOnlineAvailable(): Promise<boolean> {
        try {
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

    async getStatus(): Promise<AISourceStatus> {
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
