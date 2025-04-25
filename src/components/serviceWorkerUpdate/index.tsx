import React, { useEffect, useState } from 'react';
import { Snackbar, Button, Alert } from '@mui/material';
import { sendSkipWaitingMessage } from '../../serviceWorkerRegistration';

interface ServiceWorkerUpdateProps {
    registration: ServiceWorkerRegistration | null;
}

const ServiceWorkerUpdate: React.FC<ServiceWorkerUpdateProps> = ({ registration }) => {
    const [showReload, setShowReload] = useState(false);

    useEffect(() => {
        if (!registration) return;

        const handleUpdate = () => {
            setShowReload(true);
        };

        // Check if there's already a waiting service worker
        if (registration.waiting) {
            handleUpdate();
        }

        // Add listener for future updates
        const onUpdateFound = () => {
            const installingWorker = registration.installing;

            if (!installingWorker) return;

            installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    handleUpdate();
                }
            };
        };

        registration.addEventListener('updatefound', onUpdateFound);

        return () => {
            registration.removeEventListener('updatefound', onUpdateFound);
        };
    }, [registration]);

    const reloadPage = () => {
        if (registration && registration.waiting) {
            sendSkipWaitingMessage(registration);

            // Add a listener for controlling change, which triggers when the new SW takes over
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        } else {
            window.location.reload();
        }
    };

    return (
        <Snackbar
            open={showReload}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert
                severity="info"
                action={
                    <Button
                        color="inherit"
                        size="small"
                        onClick={reloadPage}
                    >
                        REFRESH
                    </Button>
                }
            >
                A new version is available!
            </Alert>
        </Snackbar>
    );
};

export default ServiceWorkerUpdate;