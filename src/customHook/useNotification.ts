import { useState, useEffect } from 'react';
import { SnackNotifyType } from '../components/snackNotifyComponent';
import { notificationService, NotificationEvent } from '../services/notificationService';

export const useNotification = () => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<SnackNotifyType>('info');
    const [duration, setDuration] = useState(3000);

    useEffect(() => {
        // Subscribe to notifications
        const unsubscribe = notificationService.addListener((event: NotificationEvent) => {
            setMessage(event.message);
            setType(event.type);
            setDuration(event.duration || 3000);
            setOpen(true);
        });

        // Cleanup on unmount
        return unsubscribe;
    }, []);

    const handleClose = () => {
        setOpen(false);
    };

    return {
        open,
        message,
        type,
        onClose: handleClose
    };
}; 