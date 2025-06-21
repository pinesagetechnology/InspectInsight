import { useState, useEffect, useCallback, useRef } from 'react';
import { Message, AppConfig, WebLLMProgress } from '../models/webllm';
import { webllmService } from '../services/webllm';
import { aiStorageService } from '../helper/aiDb';
import { modelManager } from '../services/modelManager';
import { MessageUtils } from '../helper/messageUtils';
import { notificationService } from '../services/notificationService';

export const useAIAssistant = () => {
    // State management
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [currentMessage, setCurrentMessage] = useState('');
    const [webGPUSupported, setWebGPUSupported] = useState<boolean | null>(null);
    const [config, setConfig] = useState<AppConfig>({
        selectedModel: 'SmolLM-1.7B-Instruct-q4f16_1-MLC',
        guidelineDocument: '',
        guidelines: {
            content: '',
        },
        settings: {
            temperature: 0.7,
            maxTokens: 1024,
            autoSave: true,
        },
    });

    // Add message helper - memoized to prevent dependency issues
    const addMessage = useCallback((role: 'user' | 'assistant' | 'system', content: string) => {
        const newMessage = MessageUtils.createMessage(role, content);
        setMessages(prev => [...prev, newMessage]);
        return newMessage;
    }, []);

    // Load saved data from storage
    const loadSavedData = useCallback(async () => {
        try {
            // Load guidelines
            const savedGuidelines = await aiStorageService.loadGuidelines();
            if (savedGuidelines) {
                setConfig(prev => ({
                    ...prev,
                    guidelines: {
                        content: savedGuidelines.content,
                        fileName: savedGuidelines.fileName,
                        uploadedAt: new Date(),
                    },
                    guidelineDocument: savedGuidelines.content,
                }));
            }

            // Load current model from storage
            const currentModelId = await aiStorageService.loadCurrentModel();
            if (currentModelId) {
                setConfig(prev => ({
                    ...prev,
                    selectedModel: currentModelId
                }));
            }

            // Load chat history if auto-save is enabled
            if (config.settings.autoSave) {
                const savedMessages = await aiStorageService.loadChatHistory();
                if (savedMessages.length > 0) {
                    setMessages(savedMessages);
                }
            }
        } catch (error) {
            console.warn('Failed to load saved data:', error);
        }
    }, [config.settings.autoSave]);

    // Initialize the application
    useEffect(() => {
        const initialize = async () => {
            console.log('Initializing AI Assistant');
            try {
                // Check WebGPU support
                const supported = await webllmService.checkWebGPUSupport();
                setWebGPUSupported(supported);

                if (!supported) {
                    notificationService.warning(
                        'WebGPU is not supported in this browser. Please use Chrome 113+ or Edge 113+ to run AI models locally.'
                    );
                    return;
                }

                // Initialize model manager
                await modelManager.initialize();

                // Load saved data
                await loadSavedData();

                console.log('AI Assistant initialized successfully');
            } catch (error) {
                console.error('Failed to initialize AI Assistant:', error);
                notificationService.error(
                    'Failed to initialize the AI assistant. Please refresh the page and try again.'
                );
            }
        };

        initialize();
    }, []);

    // Save chat history when messages change
    useEffect(() => {
        if (config.settings.autoSave && messages.length > 0) {
            const saveHistory = async () => {
                try {
                    await aiStorageService.saveChatHistory(messages);
                } catch (error) {
                    console.warn('Failed to save chat history:', error);
                }
            };

            const timeoutId = setTimeout(saveHistory, 2000); // Debounce saves
            return () => clearTimeout(timeoutId);
        }
    }, [messages, config.settings.autoSave]);

    // Handle sending messages
    const sendMessage = useCallback(async (messageContent?: string) => {
        const content = messageContent || currentMessage.trim();
        if (!content) return;

        // Clear input if using current message
        if (!messageContent) {
            setCurrentMessage('');
        }

        // Add user message
        addMessage('user', content);
        setIsLoading(true);

        try {
            // Check if WebGPU is supported
            if (!webGPUSupported) {
                notificationService.warning(
                    'WebGPU is required but not supported in this browser. Please use Chrome 113+ or Edge 113+ for local AI functionality.'
                );
                return;
            }

            // Check if model is ready
            if (!webllmService.isReady()) {
                const selectedModel = modelManager.getModel(config.selectedModel);
                if (!selectedModel?.isDownloaded) {
                    notificationService.warning(
                        'Please download and initialize a model first from the settings panel.'
                    );
                    return;
                }

                notificationService.warning(
                    'Model is not ready. Please wait for initialization to complete or try switching models.'
                );
                return;
            }

            // Generate response
            const currentMessages = [...messages, MessageUtils.createMessage('user', content)];
            const response = await webllmService.generateResponse(
                currentMessages,
                config.guidelines.content
            );

            addMessage('assistant', response);
        } catch (error) {
            console.error('Failed to generate response:', error);
            notificationService.error('I encountered an error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [currentMessage, messages, webGPUSupported, config, addMessage]);

    // Download model
    const downloadModel = useCallback(async (
        modelId: string,
        onProgress?: (progress: WebLLMProgress) => void
    ) => {
        if (!webGPUSupported) {
            notificationService.error('WebGPU is required but not supported');
            throw new Error('WebGPU is required but not supported');
        }

        try {
            await modelManager.downloadModel(modelId, onProgress);
            notificationService.success(
                `Model ${modelManager.getModel(modelId)?.displayName || modelId} downloaded successfully and is ready for use!`
            );
        } catch (error) {
            console.error('Model download failed:', error);
            notificationService.error('Failed to download model');
            throw error;
        }
    }, [webGPUSupported]);

    // Delete model
    const deleteModel = useCallback(async (modelId: string) => {
        try {
            await modelManager.deleteModel(modelId);
            notificationService.success(
                `Model ${modelManager.getModel(modelId)?.displayName || modelId} deleted successfully`
            );
        } catch (error) {
            console.error('Model deletion failed:', error);
            notificationService.error('Failed to delete model');
            throw error;
        }
    }, []);

    // Switch model
    const switchModel = useCallback(async (
        modelId: string,
        onProgress?: (progress: WebLLMProgress) => void
    ) => {
        if (modelManager.getCurrentModel() === modelId) {
            return; // Already using this model
        }

        setIsInitializing(true);
        try {
            await modelManager.switchToModel(modelId, onProgress);
            // Update local config state to reflect the new model
            setConfig(prev => ({ ...prev, selectedModel: modelId }));

            const modelName = modelManager.getModel(modelId)?.displayName || modelId;
            notificationService.success(`Switched to ${modelName}. I'm ready to help!`);
        } catch (error) {
            console.error('Model switch failed:', error);
            notificationService.error('Failed to switch to model');
            throw error;
        } finally {
            setIsInitializing(false);
        }
    }, []);

    // Handle file upload for guidelines
    const handleGuidelinesUpload = useCallback(async (file: File) => {
        try {
            const content = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.onerror = reject;
                reader.readAsText(file);
            });

            // Save guidelines
            await aiStorageService.saveGuidelines(content, file.name);

            // Update config
            setConfig(prev => ({
                ...prev,
                guidelines: {
                    content,
                    fileName: file.name,
                    uploadedAt: new Date(),
                },
                guidelineDocument: content,
            }));

            notificationService.success(
                `Guidelines document "${file.name}" uploaded successfully!`
            );
        } catch (error) {
            console.error('Failed to upload guidelines:', error);
            throw new Error('Failed to upload guidelines file');
        }
    }, []);

    // Clear chat history
    const clearChat = useCallback(async () => {
        setMessages([]);
        try {
            await webllmService.resetChat();
            await aiStorageService.saveChatHistory([]);
            console.log('Chat history cleared successfully');
        } catch (error) {
            console.warn('Failed to clear chat storage:', error);
        }
    }, []);

    // Export chat
    const exportChat = useCallback(() => {
        const markdown = MessageUtils.exportMessagesToMarkdown(messages);
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-chat-${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        notificationService.success('Chat exported successfully');
    }, [messages]);

    // Get application state
    const getState = useCallback(() => ({
        isReady: webllmService.isReady(),
        currentModel: modelManager.getCurrentModel(),
        availableModels: modelManager.getAvailableModels(),
        downloadedModels: modelManager.getDownloadedModels(),
        modelStats: modelManager.getModelStats(),
        conversationStats: MessageUtils.getConversationStats(messages),
        hasGuidelines: Boolean(config.guidelines.content),
        webGPUSupported,
    }), [messages, config.guidelines.content, webGPUSupported]);

    return {
        // State
        messages,
        currentMessage,
        setCurrentMessage,
        isLoading,
        isInitializing,
        webGPUSupported,
        config,
        setConfig,

        // Actions
        sendMessage,
        downloadModel,
        deleteModel,
        switchModel,
        handleGuidelinesUpload,
        clearChat,
        exportChat,
        addMessage,

        // Getters
        getState,

        // Utilities
        MessageUtils,
    };
};