// src/services/modelManager.ts
import { ModelConfig, WebLLMProgress } from '../models/webllm';
import { webllmService } from './webllm';
import { aiStorageService } from '../helper/aiDb';

export class ModelManager {
    private availableModels: ModelConfig[] = [
        {
            modelId: 'Llama-3.2-3B-Instruct-q4f32_1-MLC',
            displayName: 'Llama 3.2 3B (Large Context - Recommended)',
            size: '~3.2GB',
            isDownloaded: false
        },
        {
            modelId: 'Llama-3.2-1B-Instruct-q4f32_1-MLC',
            displayName: 'Llama 3.2 1B (Large Context)',
            size: '~1.8GB',
            isDownloaded: false
        },
        {
            modelId: 'Llama-2-7b-chat-hf-q4f16_1-MLC',
            displayName: 'Llama 2 7B Chat (4-bit quantized)',
            size: '~3.5GB',
            isDownloaded: false
        },
        {
            modelId: 'Mistral-7B-Instruct-v0.2-q4f16_1-MLC',
            displayName: 'Mistral 7B Instruct v0.2 (4-bit quantized)',
            size: '~3.5GB',
            isDownloaded: false
        },
        {
            modelId: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
            displayName: 'Phi-3.5 Mini (4-bit quantized - Fast)',
            size: '~2.1GB',
            isDownloaded: false
        },
        {
            modelId: 'Qwen2.5-7B-Instruct-q4f16_1-MLC',
            displayName: 'Qwen 2.5 7B Instruct (4-bit quantized)',
            size: '~3.8GB',
            isDownloaded: false
        },
        {
            modelId: 'gemma-2-2b-it-q4f16_1-MLC',
            displayName: 'Gemma 2 2B (4-bit quantized - Fast)',
            size: '~1.2GB',
            isDownloaded: false
        }
    ];

    private downloadCallbacks: Map<string, (progress: WebLLMProgress) => void> = new Map();

    async initialize(): Promise<void> {
        try {
            // These models are already built into WebLLM, no need to register them as custom
            console.log('Model manager initializing - using built-in WebLLM models');

            // Load model states from storage
            const modelStates = await aiStorageService.getAllModelStates();

            this.availableModels = this.availableModels.map(model => ({
                ...model,
                isDownloaded: modelStates[model.modelId] || false
            }));

            // Load and set the current model
            const currentModelId = await aiStorageService.loadCurrentModel();
            if (currentModelId) {
                const currentModel = this.getModel(currentModelId);
                if (currentModel?.isDownloaded) {
                    // Initialize the WebLLM service with the current model
                    await webllmService.initialize(currentModelId);
                    console.log(`Initialized with saved current model: ${currentModelId}`);
                } else {
                    console.warn(`Saved current model ${currentModelId} is not downloaded, will use default`);
                }
            }

            console.log('Model manager initialized');
            
            // Test model availability (for debugging)
            await this.testModelAvailability();
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

            // Auto-switch to the newly downloaded model
            await this.switchToModel(modelId);

            console.log(`Model ${modelId} downloaded and activated successfully`);
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

            // Save the current model to persistent storage
            await aiStorageService.saveCurrentModel(modelId);

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
        customModels: ModelConfig[];
    } {
        const warnings: string[] = [];
        const compatible: ModelConfig[] = [];
        const incompatible: ModelConfig[] = [];
        const customModels: ModelConfig[] = [];

        this.availableModels.forEach(model => {
            // Check if model is in WebLLM's supported list
            const supportedModels = webllmService.getAvailableModels();

            if (supportedModels.includes(model.modelId)) {
                // Check if it's a custom model (should be empty now since we're using built-in models)
                const customModelInfo = webllmService.getCustomModelInfo(model.modelId);
                if (customModelInfo) {
                    customModels.push(model);
                } else {
                    compatible.push(model);
                }
            } else {
                incompatible.push(model);
                warnings.push(`Model ${model.displayName} may not be supported in current WebLLM version`);
            }
        });

        return { compatible, incompatible, warnings, customModels };
    }

    // Add method to test model availability
    async testModelAvailability(): Promise<void> {
        try {
            console.log('Testing model availability...');
            
            // Check if models are available in WebLLM
            const availableModels = webllmService.getAvailableModels();
            console.log('Total available models in WebLLM:', availableModels.length);
            
            // Check our specific models
            const ourModels = this.availableModels.map(m => m.modelId);
            console.log('Our configured models:', ourModels);
            
            // Check which of our models are available
            const availableOurModels = ourModels.filter(modelId => availableModels.includes(modelId));
            const unavailableOurModels = ourModels.filter(modelId => !availableModels.includes(modelId));
            
            console.log('✅ Available models from our list:', availableOurModels);
            if (unavailableOurModels.length > 0) {
                console.log('❌ Unavailable models from our list:', unavailableOurModels);
            }
            
            // Validate compatibility
            const compatibility = this.validateModelCompatibility();
            console.log('Model compatibility:', compatibility);
            
            console.log('Model availability test completed successfully');
        } catch (error) {
            console.error('Model availability test failed:', error);
        }
    }

    // Add method to get detailed model information
    getModelDetails(modelId: string): {
        model: ModelConfig | undefined;
        isCustom: boolean;
        customInfo?: {model_id: string, model_url: string, display_name: string, size: string};
    } {
        const model = this.getModel(modelId);
        const customInfo = webllmService.getCustomModelInfo(modelId);
        
        return {
            model,
            isCustom: !!customInfo,
            customInfo
        };
    }
}

export const modelManager = new ModelManager();