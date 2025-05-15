import { useDispatch } from 'react-redux';
import { AppRouter } from './navigation/routes';
import React, { Suspense, useEffect, useState } from 'react';
import { PayloadAction } from '@reduxjs/toolkit';
import Header from './components/header';
import * as sharedActions from "./store/Common/actions";
import InstallPrompt from './components/installPrompt';
import ServiceWorkerUpdate from './components/serviceWorkerUpdate';
import AppInitialization from './components/appInitialization';
import { AuthProvider } from './context';
import {
    Alert,
    Backdrop,
    CircularProgress,
    Snackbar,
    SnackbarCloseReason,
    Button,
} from '@mui/material';
import { useOfflineSync } from './systemAvailability/useOfflineSync';
import { useSelector } from 'react-redux';
import { getShowOverlayFlag } from './store/Common/selectors';
import { useOfflineNavigation } from './navigation';

export const MainComponent: React.FunctionComponent = () => {
    useOfflineNavigation();
    const dispatch = useDispatch();

    const isOnline = useOfflineSync();
    const showLoading = useSelector(getShowOverlayFlag);
    const [openSnack, setOpenSnack] = useState<boolean>(false);
    const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
    const [offlineMode, setOfflineMode] = useState<boolean>(!navigator.onLine);
    const [snackMessage, setSnackMessage] = useState<string>('');
    const [snackSeverity, setSnackSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('info');

    // Monitor online/offline status
    useEffect(() => {
        const handleOnline = () => {
            console.log('App is back online!');
            setOfflineMode(false);
            setSnackMessage('Connected to the server!');
            setSnackSeverity('success');
            setOpenSnack(true);
            
            // Attempt to update SW when coming back online
            if (swRegistration) {
                swRegistration.update().catch(err => {
                    console.warn('Failed to update SW after coming online:', err);
                });
            }
        };

        const handleOffline = () => {
            console.log('App is offline!');
            setOfflineMode(true);
            setSnackMessage('Disconnected from server! Using offline mode');
            setSnackSeverity('warning');
            setOpenSnack(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [swRegistration]);

    useEffect(() => {
        setOpenSnack(true);
        if (isOnline) {
            setSnackMessage('Connected to the server!');
            setSnackSeverity('success');
        } else {
            setSnackMessage('Disconnected from server!');
            setSnackSeverity('warning');
        }
    }, [isOnline]);

    const handleSnackClose = (
        event?: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
    ) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenSnack(false);
    };

    // Function to manually check for app updates
    const checkForUpdates = () => {
        if (swRegistration) {
            dispatch({
                type: sharedActions.SHOW_LOADING_OVERLAY
            } as PayloadAction);
            
            swRegistration.update()
                .then(() => {
                    setSnackMessage('Checked for updates');
                    setSnackSeverity('info');
                    setOpenSnack(true);
                })
                .catch(error => {
                    console.error('Error checking for updates:', error);
                    setSnackMessage('Failed to check for updates');
                    setSnackSeverity('error');
                    setOpenSnack(true);
                })
                .finally(() => {
                    dispatch({
                        type: sharedActions.CLOSE_LOADING_OVERLAY
                    } as PayloadAction);
                });
        }
    };

    const handleClose = () => {
        dispatch({
            type: sharedActions.CLOSE_LOADING_OVERLAY
        } as PayloadAction);
    };

    return (
        <AppInitialization>
            <AuthProvider>
                <Backdrop
                    sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                    open={showLoading}
                    onClick={handleClose}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
                <Suspense fallback={
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100vh'
                    }}>
                        <CircularProgress />
                    </div>
                }>
                    <div className="d-flex flex-column min-vh-100">
                        <Header headerValue="Inspection App" />
                        <Snackbar
                            open={openSnack}
                            autoHideDuration={6000}
                            onClose={handleSnackClose}
                            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                        >
                            <Alert
                                onClose={handleSnackClose}
                                severity={snackSeverity}
                                variant="filled"
                                sx={{ width: '100%' }}
                                action={
                                    offlineMode && (
                                        <Button color="inherit" size="small" onClick={checkForUpdates}>
                                            Check Updates
                                        </Button>
                                    )
                                }
                            >
                                {snackMessage}
                            </Alert>
                        </Snackbar>
                        <AppRouter />
                        <InstallPrompt />
                        <ServiceWorkerUpdate registration={swRegistration} />
                    </div>
                </Suspense>
            </AuthProvider>
        </AppInitialization>
    );
};