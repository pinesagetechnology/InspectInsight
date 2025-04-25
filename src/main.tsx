import { useDispatch } from 'react-redux';
import { AppRouter } from './navigation/routes';
import React, { Suspense, useEffect, useState } from 'react';
import { PayloadAction } from '@reduxjs/toolkit';
import Header from './components/header';
import * as actions from "./store/Structure/actions";
import * as sharedActions from "./store/Common/actions";
import * as localDataActions from "./store/LocalStorage/actions";
import InstallPrompt from './components/installPrompt';
import ServiceWorkerUpdate from './components/serviceWorkerUpdate';
import AppInitialization from './components/appInitialization';
import {
    Alert,
    Backdrop,
    CircularProgress,
    Snackbar,
    SnackbarCloseReason,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button
} from '@mui/material';
import { useOfflineSync } from './systemAvailability/useOfflineSync';
import { useSelector } from 'react-redux';
import { getShowOverlayFlag } from './store/Common/selectors';
import { getLocalStorageFlag } from './store/LocalStorage/selector';
import { useNavigationManager } from './navigation';
import { RoutesValueEnum } from './enums';

export const MainComponent: React.FunctionComponent = () => {
    const dispatch = useDispatch();
    const { goTo } = useNavigationManager();

    const isOnline = useOfflineSync();
    const showLoading = useSelector(getShowOverlayFlag);
    const hasLocalData = useSelector(getLocalStorageFlag);
    const [openSnack, setOpenSnack] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = React.useState(false);
    const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        const handleOnlineStatusChange = () => {
            setOpenSnack(true);
        };

        window.addEventListener('online', handleOnlineStatusChange);
        window.addEventListener('offline', handleOnlineStatusChange);

        // Get service worker registration
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                setSwRegistration(registration);
            }).catch(err => {
                console.error('Failed to get SW registration:', err);
            });
        }

        return () => {
            window.removeEventListener('online', handleOnlineStatusChange);
            window.removeEventListener('offline', handleOnlineStatusChange);
        };
    }, []);

    useEffect(() => {
        setOpenSnack(true);
    }, [isOnline]);

    useEffect(() => {
        dispatch({
            type: actions.FETCH_STRUCTURES_DATA
        } as PayloadAction);

        dispatch({
            type: localDataActions.CHECK_LOCAL_STORAGE_EXIST
        } as PayloadAction);
    }, [dispatch]);

    useEffect(() => {
        if (hasLocalData) {
            setModalOpen(true);
        }
    }, [hasLocalData]);

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

    const handleModalClose = () => {
        setModalOpen(false);
    };

    const handleDiscardData = () => {
        dispatch({
            type: localDataActions.REMOVE_FROM_LOCAL_STORAGE
        } as PayloadAction);

        setModalOpen(false);

        goTo(RoutesValueEnum.Home);
    };

    const handleLoadData = () => {
        dispatch({
            type: localDataActions.MAP_LOCAL_STORAGE_STATE
        } as PayloadAction);

        setModalOpen(false);

        goTo(RoutesValueEnum.InspectionReview);
    };

    return (
        <AppInitialization>
            <Dialog
                open={modalOpen}
                onClose={handleModalClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Session data found
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Previous session data was found. Would you like to continue from where you left off or start fresh?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDiscardData}>Discard data</Button>
                    <Button onClick={handleLoadData} autoFocus>
                        Load Data
                    </Button>
                </DialogActions>
            </Dialog>

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
        </AppInitialization>
    );
};