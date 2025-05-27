import React, { useEffect, useState } from 'react';
import { StructureElement } from "entities/structure";
import {
    Badge,
    Button,
    Divider,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import styles from "./style.module.scss";
import { useDispatch, useSelector } from 'react-redux';
import { getSelectedStructureElement } from '../../store/ConditionRating/selectors';
import * as actions from "../../store/ConditionRating/actions";
import * as maintenanceActions from "../../store/MaintenanceAction/actions";
import PostAddIcon from '@mui/icons-material/PostAdd';
import { PayloadAction } from '@reduxjs/toolkit';
import RMADialog from '../maintenanceActionsDialog/rmaDialog';
import RatingComponent from '../../components/ratingComponent';
import { getMaintenanceActionModalFlag, getMaintenanceActions } from '../../store/MaintenanceAction/selectors';
import { MaintenanceActionModel } from 'models/inspectionModel';
import { RMAModeEnum } from '../../enums';

interface AssessmentPanelProps {
    isTablet: boolean;
}

const AssessmentPanel: React.FC<AssessmentPanelProps> = ({
    isTablet,
}) => {
    const dispatch = useDispatch();
    const maintenanceActionModalFlag = useSelector(getMaintenanceActionModalFlag);
    const selectedIFCElement = useSelector(getSelectedStructureElement);
    const maintenanceActionList = useSelector(getMaintenanceActions);
    
    const addAssessmentOnClick = () => {
        if (!selectedIFCElement) return;
        const newMaintenanceAction = {
            id: "-1",
            isSectionExpanded: true,
            dateForCompletion: new Date().toISOString(),
            elementCode: selectedIFCElement.data?.Name || "",
            elementDescription: selectedIFCElement.data?.Entity || "",
            elementId: selectedIFCElement.data?.expressID.toString() || "",
            mode: 1
        } as MaintenanceActionModel;

        dispatch({
            type: maintenanceActions.ADD_NEW_ITEM,
            payload: newMaintenanceAction
        } as PayloadAction<MaintenanceActionModel>)
    }

    const handleClose = () => {
        dispatch({
            type: maintenanceActions.SET_MAINTENANCE_ACTION_MODAL_FLAG,
            payload: false
        } as PayloadAction<boolean>)
    }

    const handleOnRatingChange = (value: string) => {
        if (!selectedIFCElement) return;

        const newRating = [0, 0, 0, 0];
        newRating[parseInt(value) - 1] = 1;

        const updatedElement = {
            ...selectedIFCElement,
            condition: newRating,
            ifcElementRatingValue: value
        };

        dispatch({
            type: actions.SAVE_CONDITION_RATING_DATA,
            payload: updatedElement
        } as PayloadAction<StructureElement>);

        dispatch({
            type: actions.SET_SELECTED_STRUCTURE_ELEMENT,
            payload: updatedElement
        } as PayloadAction<StructureElement>);

    }

    return (
        <Paper
            elevation={0}
            sx={{ marginTop: 1 }}
        >
            <Stack spacing={2}>
                <Typography variant="h6">Condition Rating</Typography>
                <Divider orientation="horizontal" flexItem className={styles.divider} />

                <Stack spacing={2}>
                    <Typography variant='subtitle1'>Element Name</Typography>
                    <Typography variant='body1'>
                        {selectedIFCElement?.data?.Name || 'No element selected'}
                    </Typography>
                </Stack>

                <Divider orientation="horizontal" flexItem className={styles.divider} />

                <RatingComponent
                    isIFcViewer={true}
                    showLabel={true}
                    rating={selectedIFCElement?.ifcElementRatingValue || ''}
                    elementId={selectedIFCElement?.data?.expressID || -1}
                    handleOnRatingChange={handleOnRatingChange}
                />

                <Divider orientation="horizontal" flexItem />


                <Badge
                    badgeContent={maintenanceActionList.filter(
                        (action) => action.elementId === selectedIFCElement.data?.expressID.toString()
                    ).length}
                    color="primary"
                    showZero={false}
                    overlap="circular"
                    sx={{ '& .MuiBadge-badge': { fontSize: '0.9rem', minWidth: 16, height: 16 } }}
                >
                    <Button
                        variant="contained"
                        endIcon={<PostAddIcon />}
                        onClick={addAssessmentOnClick}
                        sx={{ width: '95%' }}
                    >
                        {isTablet ? 'Add assessment' : 'Add maintenance action'}
                    </Button>
                </Badge>
            </Stack>

            <RMADialog
                handleClose={handleClose}
                modalState={maintenanceActionModalFlag}
                rmaMode={RMAModeEnum.IFCElement}
            />
        </Paper>
    );
};

export default AssessmentPanel;