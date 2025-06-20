// src/services/modelManager.ts
import { ModelConfig, WebLLMProgress } from '../models/webllm';
import { webllmService } from './webllm';
import { aiStorageService } from '../helper/aiDb';

export class ModelManager {
    private availableModels: ModelConfig[] = [
        {
            modelId: 'SmolLM-1.7B-Instruct-q4f16_1-MLC',
            displayName: 'SmolLM 1.7B (Fastest)',
            size: '~1.2GB',
            isDownloaded: false
        },
        {
            modelId: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
            displayName: 'Phi-3.5 Mini',
            size: '~2.4GB',
            isDownloaded: false
        },
        {
            modelId: 'Llama-3.2-1B-Instruct-q4f32_1-MLC',
            displayName: 'Llama 3.2 1B',
            size: '~1.8GB',
            isDownloaded: false
        },
        {
            modelId: 'Llama-3.2-3B-Instruct-q4f32_1-MLC',
            displayName: 'Llama 3.2 3B (Recommended)',
            size: '~3.2GB',
            isDownloaded: false
        }
    ];

    private downloadCallbacks: Map<string, (progress: WebLLMProgress) => void> = new Map();

    async initialize(): Promise<void> {
        try {
            // Load model states from storage
            const modelStates = await aiStorageService.getAllModelStates();

            this.availableModels = this.availableModels.map(model => ({
                ...model,
                isDownloaded: modelStates[model.modelId] || false
            }));

            console.log('Model manager initialized');
        } catch (error) {
            console.error('Failed to initialize model manager:', error);
        }
    }

    getAvailableModels(): ModelConfig[] {
        return [...this.availableModels];
    }

    getModel(modelId: string): ModelConfig | undefined {
        return this.availableModels.find(model => model.modelId === modelId);
    }

    getDownloadedModels(): ModelConfig[] {
        return this.availableModels.filter(model => model.isDownloaded);
    }

    getRecommendedModel(): ModelConfig {
        // Return fastest available downloaded model, or fastest overall
        const downloaded = this.getDownloadedModels();
        if (downloaded.length > 0) {
            return downloaded[0]; // First in list is usually fastest
        }
        return this.availableModels[0]; // SmolLM as default recommendation
    }

    async downloadModel(
        modelId: string,
        onProgress?: (progress: WebLLMProgress) => void
    ): Promise<void> {
        const model = this.getModel(modelId);
        if (!model) {
            throw new Error(`Model ${modelId} not found`);
        }

        if (model.isDownloaded) {
            console.log(`Model ${modelId} already downloaded`);
            return;
        }

        console.log(`Starting download for model: ${modelId}`);

        try {
            // Store progress callback
            if (onProgress) {
                this.downloadCallbacks.set(modelId, onProgress);
            }

            // Update model state to show download in progress
            this.updateModelProgress(modelId, 0);

            // Initialize model through WebLLM (this downloads and caches it)
            await webllmService.initialize(modelId, (progress) => {
                this.updateModelProgress(modelId, progress.progress);
                onProgress?.(progress);
            });

            // Mark as downloaded
            await this.markModelAsDownloaded(modelId);

            console.log(`Model ${modelId} downloaded successfully`);
        } catch (error) {
            console.error(`Failed to download model ${modelId}:`, error);
            this.updateModelProgress(modelId, undefined);
            throw new Error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            this.downloadCallbacks.delete(modelId);
        }
    }

    async switchToModel(
        modelId: string,
        onProgress?: (progress: WebLLMProgress) => void
    ): Promise<void> {
        const model = this.getModel(modelId);
        if (!model) {
            throw new Error(`Model ${modelId} not found`);
        }

        if (!model.isDownloaded) {
            throw new Error(`Model ${modelId} is not downloaded. Please download it first.`);
        }

        try {
            await webllmService.switchModel(modelId, onProgress);

            // Update last used timestamp
            this.updateModelLastUsed(modelId);

            console.log(`Switched to model: ${modelId}`);
        } catch (error) {
            console.error(`Failed to switch to model ${modelId}:`, error);
            throw error;
        }
    }

    private async markModelAsDownloaded(modelId: string): Promise<void> {
        // Update local state
        this.availableModels = this.availableModels.map(model =>
            model.modelId === modelId
                ? { ...model, isDownloaded: true, downloadProgress: undefined, lastUsed: new Date() }
                : model
        );

        // Persist to storage
        await aiStorageService.saveModelState(modelId, true);
    }

    private updateModelProgress(modelId: string, progress?: number): void {
        this.availableModels = this.availableModels.map(model =>
            model.modelId === modelId
                ? { ...model, downloadProgress: progress }
                : model
        );
    }

    private updateModelLastUsed(modelId: string): void {
        this.availableModels = this.availableModels.map(model =>
            model.modelId === modelId
                ? { ...model, lastUsed: new Date() }
                : model
        );
    }

    async deleteModel(modelId: string): Promise<void> {
        const model = this.getModel(modelId);
        if (!model) {
            throw new Error(`Model ${modelId} not found`);
        }

        try {
            // If this is the current model, unload it first
            if (webllmService.getCurrentModel() === modelId) {
                await webllmService.unload();
            }

            // Update local state
            this.availableModels = this.availableModels.map(model =>
                model.modelId === modelId
                    ? { ...model, isDownloaded: false, downloadProgress: undefined, lastUsed: undefined }
                    : model
            );

            // Update storage
            await aiStorageService.saveModelState(modelId, false);

            console.log(`Model ${modelId} marked as deleted`);
        } catch (error) {
            console.error(`Failed to delete model ${modelId}:`, error);
            throw error;
        }
    }

    getCurrentModel(): string | null {
        return webllmService.getCurrentModel();
    }

    isModelReady(): boolean {
        return webllmService.isReady();
    }

    async getModelInfo(): Promise<string> {
        return webllmService.getModelInfo();
    }

    getModelStats(): {
        totalModels: number;
        downloadedModels: number;
        totalSize: string;
        downloadedSize: string;
    } {
        const downloaded = this.getDownloadedModels();

        return {
            totalModels: this.availableModels.length,
            downloadedModels: downloaded.length,
            totalSize: this.calculateTotalSize(this.availableModels),
            downloadedSize: this.calculateTotalSize(downloaded)
        };
    }

    private calculateTotalSize(models: ModelConfig[]): string {
        // Simple estimation - in reality you'd want more precise calculations
        const totalGB = models.reduce((sum, model) => {
            const sizeStr = model.size.replace(/[^0-9.]/g, '');
            return sum + parseFloat(sizeStr);
        }, 0);

        return `~${totalGB.toFixed(1)}GB`;
    }

    validateModelCompatibility(): {
        compatible: ModelConfig[];
        incompatible: ModelConfig[];
        warnings: string[];
    } {
        const warnings: string[] = [];
        const compatible: ModelConfig[] = [];
        const incompatible: ModelConfig[] = [];

        this.availableModels.forEach(model => {
            // Check if model is in WebLLM's supported list
            const supportedModels = webllmService.getAvailableModels();

            if (supportedModels.includes(model.modelId)) {
                compatible.push(model);
            } else {
                incompatible.push(model);
                warnings.push(`Model ${model.displayName} may not be supported in current WebLLM version`);
            }
        });

        return { compatible, incompatible, warnings };
    }
}

export const modelManager = new ModelManager();