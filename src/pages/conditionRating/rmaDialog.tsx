import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, useMediaQuery, useTheme } from '@mui/material';
import React from 'react'
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import AssessmentFrom from './maintenanceActions';

interface RMADialogProps {
    modalState: boolean;
    handleClose: () => void;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const RMADialog: React.FunctionComponent<RMADialogProps> = ({
    handleClose,
    modalState
}) => {
    const theme = useTheme();
    const isTablet = useMediaQuery('(max-width:960px)');
    const isPortrait = useMediaQuery('(max-width:600px)');

    const SubmitAndClose = () => {
        handleClose();
    }

    return (
        <React.Fragment>
            <BootstrapDialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={modalState}
                fullScreen={isPortrait}
                sx={{
                    '& .MuiDialog-paper': {
                        minWidth: isPortrait ? '100%' : isTablet ? '80%' : '350px',
                        maxHeight: isTablet ? '90vh' : '80vh',
                    },
                }}
            >
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    Required Maintenance Action
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[500],
                    })}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent dividers>
                    <AssessmentFrom />
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={SubmitAndClose}>
                        Close
                    </Button>
                </DialogActions>
            </BootstrapDialog>
        </React.Fragment>
    )
}

export default RMADialog;