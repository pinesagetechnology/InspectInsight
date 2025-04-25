import React, { useEffect, useState } from 'react';
import { Snackbar, Button, Alert, CircularProgress } from '@mui/material';
import { sendSkipWaitingMessage } from '../../serviceWorkerRegistration';

interface ServiceWorkerUpdateProps {
    registration: ServiceWorkerRegistration | null;
}

const ServiceWorkerUpdate: React.FC<ServiceWorkerUpdateProps> = ({ registration }) => {
    const [showReload, setShowReload] = useState(false);
    const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (!registration) return;

        // Handle update detection
        const handleUpdate = (worker: ServiceWorker) => {
            setWaitingWorker(worker);
            setShowReload(true);
        };

        // Check if there's already a waiting service worker
        if (registration.waiting) {
            handleUpdate(registration.waiting);
        }

        // Add listener for future updates
        const onUpdateFound = () => {
            const installingWorker = registration.installing;

            if (!installingWorker) return;

            installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    handleUpdate(installingWorker);
                }
            };
        };

        registration.addEventListener('updatefound', onUpdateFound);

        // Periodically check for updates (once every 60 minutes)
        const updateCheckInterval = setInterval(() => {
            if (registration && !showReload) {
                registration.update().catch(err => {
                    console.error('Error checking for updates:', err);
                });
            }
        }, 60 * 60 * 1000);

        return () => {
            registration.removeEventListener('updatefound', onUpdateFound);
            clearInterval(updateCheckInterval);
        };
    }, [registration, showReload]);

    // Handle reload button click
    const reloadPage = () => {
        if (!waitingWorker) {
            window.location.reload();
            return;
        }

        setIsUpdating(true);

        // Add a listener for controlling change, which triggers when the new SW takes over
        const onControllerChange = () => {
            window.location.reload();
        };

        navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

        // Send skip waiting message
        try {
            sendSkipWaitingMessage(registration!);

            // Safety timeout - reload anyway after 3 seconds if controllerchange didn't fire
            setTimeout(() => {
                navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
                window.location.reload();
            }, 3000);
        } catch (err) {
            console.error('Error during update:', err);
            window.location.reload();
        }
    };

    // Handle dismiss
    const handleDismiss = () => {
        setShowReload(false);
    };

    return (
        <Snackbar
            open={showReload}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert
                severity="info"
                action={
                    <>
                        <Button
                            color="inherit"
                            size="small"
                            onClick={handleDismiss}
                            disabled={isUpdating}
                        >
                            LATER
                        </Button>
                        <Button
                            color="primary"
                            variant="contained"
                            size="small"
                            onClick={reloadPage}
                            disabled={isUpdating}
                            startIcon={isUpdating ? <CircularProgress size={16} color="inherit" /> : null}
                        >
                            {isUpdating ? 'UPDATING...' : 'UPDATE NOW'}
                        </Button>
                    </>
                }
            >
                A new version is available!
            </Alert>
        </Snackbar>
    );
};

export default ServiceWorkerUpdate;