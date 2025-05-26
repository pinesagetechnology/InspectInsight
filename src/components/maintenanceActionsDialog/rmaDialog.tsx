import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    useMediaQuery
} from '@mui/material';
import React, { useEffect, useState } from 'react'
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { useSelector } from 'react-redux';
import { getElementMaintenanceAction, getIFCElementMaintenanceAction } from '../../store/MaintenanceAction/selectors';
import { getSelectedElementCode, getSelectedStructureElement } from '../../store/ConditionRating/selectors';
import MaintenanceSection from '../maintenanceSection';
import { MaintenanceActionModel } from '../../models/inspectionModel';
import { RMAModeEnum } from '../../enums';
interface RMADialogProps {
    modalState: boolean;
    handleClose: () => void;
    rmaMode: RMAModeEnum;
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
    modalState,
    rmaMode
}) => {
    const isTablet = useMediaQuery('(max-width:960px)');
    const isPortrait = useMediaQuery('(max-width:600px)');
    let maintenanceActions: MaintenanceActionModel[] = [];
    if (rmaMode === RMAModeEnum.IFCElement) {
        const selectedElemment = useSelector(getSelectedStructureElement);

        maintenanceActions = useSelector(getIFCElementMaintenanceAction(selectedElemment?.data?.expressID?.toString() || ""));
    } else {
        const selectedElemment = useSelector(getSelectedElementCode);
        maintenanceActions = useSelector(getElementMaintenanceAction(selectedElemment.elementCode));
    }

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
                    <Stack
                        direction={'column'}
                        spacing={isPortrait ? 1 : 2}
                        sx={{ mt: 2 }}
                    >
                        {maintenanceActions?.map((item, index) => {
                            return <MaintenanceSection key={`${index}-${item.id}`} maintenanceActionData={item} />
                        })}
                    </Stack>
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