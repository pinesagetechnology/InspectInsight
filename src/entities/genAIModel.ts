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

// Defines the shape of your API’s response
export interface InspectionReport {
    response: string;
    chatHistory: ChatMessage[];
}

export interface ChatMessage {
    role: Role;
    content: string;
}

export interface Role {
    value: string;
}

export interface GenAIRequest {
    contextJson: string;
    previousInspectionJson: string;
}
