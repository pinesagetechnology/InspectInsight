import React from 'react';
import { Snackbar, Alert, SnackbarCloseReason } from '@mui/material';

export type SnackNotifyType = 'success' | 'info' | 'warning' | 'error';

interface SnackNotifyProps {
    open: boolean;
    message: string;
    type: SnackNotifyType;
    onClose?: (event?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => void;
}

const SnackNotifyComponent: React.FC<SnackNotifyProps> = ({
    open,
    message,
    type,
    onClose,
}) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={3000}
            onClose={onClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Top middle
        >
            <Alert
                onClose={onClose}
                severity={type}
                sx={{ width: '100%' }}
                variant="filled"
            >
                {message}
            </Alert>
        </Snackbar>
    );
};

export default SnackNotifyComponent;

