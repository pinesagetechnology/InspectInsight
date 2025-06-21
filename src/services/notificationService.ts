import { SnackNotifyType } from '../components/snackNotifyComponent';

// Event types for notifications
export interface NotificationEvent {
    type: SnackNotifyType;
    message: string;
    duration?: number;
}

// Custom event for notifications
const NOTIFICATION_EVENT = 'ai-assistant-notification';

class NotificationService {
    private listeners: Set<(event: NotificationEvent) => void> = new Set();

    constructor() {
        // Listen for custom events
        if (typeof window !== 'undefined') {
            window.addEventListener(NOTIFICATION_EVENT, ((event: CustomEvent<NotificationEvent>) => {
                this.notifyListeners(event.detail);
            }) as EventListener);
        }
    }

    // Show a notification
    show(type: SnackNotifyType, message: string, duration?: number): void {
        const notification: NotificationEvent = {
            type,
            message,
            duration
        };

        // Dispatch custom event
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail: notification }));
        }

        // Also notify direct listeners
        this.notifyListeners(notification);
    }

    // Success notification
    success(message: string, duration?: number): void {
        this.show('success', message, duration);
    }

    // Error notification
    error(message: string, duration?: number): void {
        this.show('error', message, duration);
    }

    // Warning notification
    warning(message: string, duration?: number): void {
        this.show('warning', message, duration);
    }

    // Info notification
    info(message: string, duration?: number): void {
        this.show('info', message, duration);
    }

    // Add listener
    addListener(callback: (event: NotificationEvent) => void): () => void {
        this.listeners.add(callback);
        
        // Return unsubscribe function
        return () => {
            this.listeners.delete(callback);
        };
    }

    private notifyListeners(event: NotificationEvent): void {
        this.listeners.forEach(listener => {
            try {
                listener(event);
            } catch (error) {
                console.error('Error in notification listener:', error);
            }
        });
    }

    // Cleanup
    destroy(): void {
        this.listeners.clear();
        if (typeof window !== 'undefined') {
            window.removeEventListener(NOTIFICATION_EVENT, ((event: CustomEvent<NotificationEvent>) => {
                this.notifyListeners(event.detail);
            }) as EventListener);
        }
    }
}

// Create singleton instance
export const notificationService = new NotificationService();

// Export for use in components
export default notificationService; 