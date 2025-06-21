import { useDispatch } from 'react-redux';
import { AppRouter } from './navigation/routes';
import React, { Suspense, useEffect, useState } from 'react';
import { PayloadAction } from '@reduxjs/toolkit';
import Header from './components/header';
import * as sharedActions from "./store/Common/actions";
import AppInitialization from './components/appInitialization';
import { AuthProvider } from './context';
import {
    Alert,
    Backdrop,
    CircularProgress,
    SnackbarCloseReason,
} from '@mui/material';
import { useOfflineSync } from './systemAvailability/useOfflineSync';
import { useSelector } from 'react-redux';
import { getShowOverlayFlag } from './store/Common/selectors';
import SnackNotifyComponent, { SnackNotifyType } from './components/snackNotifyComponent';

export const MainComponent: React.FunctionComponent = () => {
    const dispatch = useDispatch();

    const isOnline = useOfflineSync();
    const showLoading = useSelector(getShowOverlayFlag);
    const [openSnack, setOpenSnack] = useState<boolean>(false);
    const [snackMessage, setSnackMessage] = useState<string>('');
    const [snackSeverity, setSnackSeverity] = useState<SnackNotifyType>('info');

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
                        {/* <Snackbar
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
                            >
                                {snackMessage}
                            </Alert>
                        </Snackbar> */}
                        <SnackNotifyComponent
                            open={openSnack}
                            message={snackMessage}
                            type={snackSeverity}
                            onClose={handleSnackClose}
                        />
                        <AppRouter />
                    </div>
                </Suspense>
            </AuthProvider>
        </AppInitialization>
    );
};