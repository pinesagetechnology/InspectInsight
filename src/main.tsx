import { useDispatch } from 'react-redux';
import { AppRouter } from './navigation/routes';
import React, { Suspense, useEffect, useState } from 'react';
import { PayloadAction } from '@reduxjs/toolkit';
import Header from './components/header';
import * as actions from "./store/Structure/actions";
import * as sharedActions from "./store/Common/actions";
import * as localDataActions from "./store/LocalStorage/actions";
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
    const [opoenSnack, setOpenSnack] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = React.useState(false);

    useEffect(() => {
        setOpenSnack(true);
    }, [isOnline])

    useEffect(() => {
        dispatch({
            type: actions.FETCH_STRUCTURES_DATA
        } as PayloadAction);

        dispatch({
            type: localDataActions.CHECK_LOCAL_STORAGE_EXIST
        } as PayloadAction);
    }, [])

    useEffect(() => {
        if(hasLocalData){
            setModalOpen(true);
        }
    }, [hasLocalData])

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
        } as PayloadAction)
    };

    const handleModalClose = () => {
        setModalOpen(false);
    }

    const handleDiscardData = () => {
        dispatch({
            type: localDataActions.REMOVE_FROM_LOCAL_STORAGE
        } as PayloadAction);

        setModalOpen(false);

        goTo(RoutesValueEnum.Home);
    }

    const handleLoadData = () => {
        dispatch({
            type: localDataActions.MAP_LOCAL_STORAGE_STATE
        } as PayloadAction);

        setModalOpen(false);

        goTo(RoutesValueEnum.InspectionReview);
    }

    return (
        <div>
            <Dialog
                open={modalOpen}
                onClose={handleModalClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    session data found
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
            <Suspense fallback={<React.Fragment></React.Fragment>} >
                <div className="d-flex flex-column min-vh-100">
                    <Header headerValue="Inspection App" />
                    <Snackbar
                        open={opoenSnack}
                        autoHideDuration={6000}
                        onClose={handleSnackClose}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    >
                        <Alert
                            onClose={handleSnackClose}
                            severity={(isOnline) ? "success" : "error"}
                            variant="filled"
                            sx={{ width: '100%' }}
                        >
                            {(isOnline) ? "Connected to the server!" : "Disconnected from server!"}
                        </Alert>
                    </Snackbar>
                    <AppRouter />
                </div>
            </Suspense>
        </div>
    );

}
