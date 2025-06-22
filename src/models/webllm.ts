export type AISource = 'local' | 'online';

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

export interface ModelConfig {
    modelId: string;
    displayName: string;
    size: string;
    isDownloaded: boolean;
    downloadProgress?: number;
    lastUsed?: Date;
}

export interface AppConfig {
    selectedModel: string;
    guidelineDocument: string;
    guidelines: {
        fileName?: string;
        content: string;
        uploadedAt?: Date;
    };
    settings: {
        temperature: number;
        maxTokens: number;
        autoSave: boolean;
    };
}

export interface WebLLMProgress {
    progress: number;
    text: string;
    timeElapsed: number;
}

export interface ChatCompletionRequest {
    messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
    }>;
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
}

export interface AIServiceInterface {
    initialize(modelId: string, onProgress?: (progress: WebLLMProgress) => void): Promise<void>;
    generateResponse(messages: Message[], guidelines: string, isChat: boolean): Promise<string>;
    isReady(): boolean;
    getCurrentModel(): string | null;
    switchModel(modelId: string, onProgress?: (progress: WebLLMProgress) => void): Promise<void>;
    resetChat(): Promise<void>;
    getModelInfo(): Promise<string>;
    getAvailableModels(): string[];
    registerCustomModel(modelConfig: {model_id: string, model_url: string, display_name: string, size: string}): void;
    registerCustomModels(modelConfigs: Array<{model_id: string, model_url: string, display_name: string, size: string}>): void;
    getCustomModelInfo(modelId: string): {model_id: string, model_url: string, display_name: string, size: string} | undefined;
    getCustomModels(): Array<{model_id: string, model_url: string, display_name: string, size: string}>;
}

export interface StorageInterface {
    saveModelState(modelId: string, isDownloaded: boolean): Promise<void>;
    loadModelState(modelId: string): Promise<boolean>;
    saveGuidelines(guidelines: string, fileName?: string): Promise<void>;
    loadGuidelines(): Promise<{ content: string; fileName?: string } | null>;
    saveChatHistory(messages: Message[]): Promise<void>;
    loadChatHistory(): Promise<Message[]>;
    clearStorage(): Promise<void>;
}

export interface AISourceStatus {
    local: {
        available: boolean;
        modelName?: string;
        webGPUSupported: boolean;
    };
    online: {
        available: boolean;
        authenticated: boolean;
    };
}

export interface AIResponse {
    response: string;
    source: AISource;
    modelName?: string;
}