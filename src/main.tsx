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
} from '@mui/material';
import { useOfflineSync } from './systemAvailability/useOfflineSync';
import { useSelector } from 'react-redux';
import { getShowOverlayFlag } from './store/Common/selectors';

export const MainComponent: React.FunctionComponent = () => {
    const dispatch = useDispatch();

    const isOnline = useOfflineSync();
    const showLoading = useSelector(getShowOverlayFlag);
    const [openSnack, setOpenSnack] = useState<boolean>(false);
    const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        // Get service worker registration
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                setSwRegistration(registration);
            }).catch(err => {
                console.error('Failed to get SW registration:', err);
            });
        }
    }, []);

    useEffect(() => {
        setOpenSnack(true);
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
                                severity={(isOnline) ? "success" : "warning"}
                                variant="filled"
                                sx={{ width: '100%' }}
                            >
                                {(isOnline) ? "Connected to the server!" : "Disconnected from server!"}
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