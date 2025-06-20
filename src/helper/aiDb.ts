// src/services/storage.ts
import { StorageInterface, Message } from '../models/webllm';

class AIStorageService implements StorageInterface {
    private dbName = 'ai-assistant-db';
    private dbVersion = 1;
    private db: IDBDatabase | null = null;

    async initDB(): Promise<IDBDatabase> {
        if (this.db) {
            return this.db;
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('Failed to open IndexedDB:', request.error);
                reject(new Error('Failed to initialize database'));
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = () => {
                const db = request.result;

                // Models store
                if (!db.objectStoreNames.contains('models')) {
                    const modelsStore = db.createObjectStore('models', { keyPath: 'modelId' });
                    modelsStore.createIndex('timestamp', 'timestamp');
                }

                // Chat history store
                if (!db.objectStoreNames.contains('chatHistory')) {
                    const chatStore = db.createObjectStore('chatHistory', { keyPath: 'id' });
                    chatStore.createIndex('timestamp', 'timestamp');
                }

                // Guidelines store
                if (!db.objectStoreNames.contains('guidelines')) {
                    db.createObjectStore('guidelines', { keyPath: 'id' });
                }
            };
        });
    }

    async saveModelState(modelId: string, isDownloaded: boolean): Promise<void> {
        try {
            const db = await this.initDB();
            const transaction = db.transaction(['models'], 'readwrite');
            const store = transaction.objectStore('models');

            const modelData = {
                modelId,
                isDownloaded,
                timestamp: Date.now(),
                lastUsed: isDownloaded ? Date.now() : null
            };

            await new Promise<void>((resolve, reject) => {
                const request = store.put(modelData);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

            console.log(`Model state saved: ${modelId} - ${isDownloaded ? 'downloaded' : 'not downloaded'}`);
        } catch (error) {
            console.error('Failed to save model state:', error);
            throw new Error('Failed to save model state to database');
        }
    }

    async loadModelState(modelId: string): Promise<boolean> {
        try {
            const db = await this.initDB();
            const transaction = db.transaction(['models'], 'readonly');
            const store = transaction.objectStore('models');

            return new Promise((resolve, reject) => {
                const request = store.get(modelId);
                request.onsuccess = () => {
                    const result = request.result;
                    resolve(result?.isDownloaded || false);
                };
                request.onerror = () => {
                    console.warn(`Failed to load model state for ${modelId}:`, request.error);
                    resolve(false); // Default to not downloaded
                };
            });
        } catch (error) {
            console.warn('Failed to load model state:', error);
            return false;
        }
    }

    async getAllModelStates(): Promise<Record<string, boolean>> {
        try {
            const db = await this.initDB();
            const transaction = db.transaction(['models'], 'readonly');
            const store = transaction.objectStore('models');

            return new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => {
                    const results = request.result;
                    const modelStates: Record<string, boolean> = {};

                    results.forEach((model: any) => {
                        modelStates[model.modelId] = model.isDownloaded;
                    });

                    resolve(modelStates);
                };
                request.onerror = () => {
                    console.warn('Failed to load all model states:', request.error);
                    resolve({});
                };
            });
        } catch (error) {
            console.warn('Failed to load all model states:', error);
            return {};
        }
    }

    async saveGuidelines(guidelines: string, fileName?: string): Promise<void> {
        try {
            // Save to localStorage for quick access
            localStorage.setItem('ai-guidelines', guidelines);
            if (fileName) {
                localStorage.setItem('ai-guidelines-filename', fileName);
            }

            // Also save to IndexedDB for durability
            const db = await this.initDB();
            const transaction = db.transaction(['guidelines'], 'readwrite');
            const store = transaction.objectStore('guidelines');

            const guidelinesData = {
                id: 'main',
                content: guidelines,
                fileName: fileName || 'guidelines.txt',
                timestamp: Date.now()
            };

            await new Promise<void>((resolve, reject) => {
                const request = store.put(guidelinesData);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

            console.log('Guidelines saved successfully');
        } catch (error) {
            console.error('Failed to save guidelines:', error);
            throw new Error('Failed to save guidelines');
        }
    }

    async loadGuidelines(): Promise<{ content: string; fileName?: string } | null> {
        try {
            // First try localStorage
            const content = localStorage.getItem('ai-guidelines');
            const fileName = localStorage.getItem('ai-guidelines-filename');

            if (content) {
                return { content, fileName: fileName || undefined };
            }

            // Fallback to IndexedDB
            const db = await this.initDB();
            const transaction = db.transaction(['guidelines'], 'readonly');
            const store = transaction.objectStore('guidelines');

            return new Promise((resolve, reject) => {
                const request = store.get('main');
                request.onsuccess = () => {
                    const result = request.result;
                    if (result) {
                        resolve({
                            content: result.content,
                            fileName: result.fileName
                        });
                    } else {
                        resolve(null);
                    }
                };
                request.onerror = () => {
                    console.warn('Failed to load guidelines from IndexedDB:', request.error);
                    resolve(null);
                };
            });
        } catch (error) {
            console.warn('Failed to load guidelines:', error);
            return null;
        }
    }

    async saveChatHistory(messages: Message[]): Promise<void> {
        try {
            // Save to localStorage for quick access (last 50 messages)
            const recentMessages = messages.slice(-50);
            localStorage.setItem('ai-chat-history', JSON.stringify(recentMessages));

            // Save to IndexedDB for full history
            const db = await this.initDB();
            const transaction = db.transaction(['chatHistory'], 'readwrite');
            const store = transaction.objectStore('chatHistory');

            // Clear existing history
            await new Promise<void>((resolve, reject) => {
                const clearRequest = store.clear();
                clearRequest.onsuccess = () => resolve();
                clearRequest.onerror = () => reject(clearRequest.error);
            });

            // Save new history
            for (const message of messages) {
                await new Promise<void>((resolve, reject) => {
                    const request = store.add({
                        ...message,
                        timestamp: message.timestamp.getTime() // Store as number
                    });
                    request.onsuccess = () => resolve();
                    request.onerror = () => reject(request.error);
                });
            }

            console.log(`Saved ${messages.length} messages to chat history`);
        } catch (error) {
            console.error('Failed to save chat history:', error);
            // Don't throw error, chat should continue working
        }
    }

    async loadChatHistory(): Promise<Message[]> {
        try {
            // First try localStorage for quick loading
            const localHistory = localStorage.getItem('ai-chat-history');
            if (localHistory) {
                const parsed = JSON.parse(localHistory);
                return parsed.map((msg: any) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));
            }

            // Fallback to IndexedDB
            const db = await this.initDB();
            const transaction = db.transaction(['chatHistory'], 'readonly');
            const store = transaction.objectStore('chatHistory');

            return new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => {
                    const results = request.result;
                    const messages = results
                        .map((msg: any) => ({
                            ...msg,
                            timestamp: new Date(msg.timestamp)
                        }))
                        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

                    resolve(messages);
                };
                request.onerror = () => {
                    console.warn('Failed to load chat history from IndexedDB:', request.error);
                    resolve([]);
                };
            });
        } catch (error) {
            console.warn('Failed to load chat history:', error);
            return [];
        }
    }

    async clearStorage(): Promise<void> {
        try {
            // Clear localStorage
            const keysToRemove = [
                'ai-guidelines',
                'ai-guidelines-filename',
                'ai-chat-history'
            ];

            keysToRemove.forEach(key => localStorage.removeItem(key));

            // Clear IndexedDB
            if (this.db) {
                this.db.close();
                this.db = null;
            }

            await new Promise<void>((resolve, reject) => {
                const deleteRequest = indexedDB.deleteDatabase(this.dbName);
                deleteRequest.onsuccess = () => resolve();
                deleteRequest.onerror = () => reject(deleteRequest.error);
            });

            console.log('Storage cleared successfully');
        } catch (error) {
            console.error('Failed to clear storage:', error);
            throw new Error('Failed to clear storage');
        }
    }

    async exportData(): Promise<string> {
        try {
            const guidelines = await this.loadGuidelines();
            const chatHistory = await this.loadChatHistory();
            const modelStates = await this.getAllModelStates();

            const exportData = {
                guidelines,
                chatHistory,
                modelStates,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };

            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            console.error('Failed to export data:', error);
            throw new Error('Failed to export data');
        }
    }

    async importData(jsonData: string): Promise<void> {
        try {
            const data = JSON.parse(jsonData);

            if (data.guidelines) {
                await this.saveGuidelines(data.guidelines.content, data.guidelines.fileName);
            }

            if (data.chatHistory && Array.isArray(data.chatHistory)) {
                const messages = data.chatHistory.map((msg: any) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));
                await this.saveChatHistory(messages);
            }

            if (data.modelStates) {
                for (const [modelId, isDownloaded] of Object.entries(data.modelStates)) {
                    await this.saveModelState(modelId, isDownloaded as boolean);
                }
            }

            console.log('Data imported successfully');
        } catch (error) {
            console.error('Failed to import data:', error);
            throw new Error('Failed to import data');
        }
    }
}

export const aiStorageService = new AIStorageService();