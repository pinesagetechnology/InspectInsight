export interface GenAIResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export interface ChatRequest {
    prompt: string;
    contextJson: string;
}