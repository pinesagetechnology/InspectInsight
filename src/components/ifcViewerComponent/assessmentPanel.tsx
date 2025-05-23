import React, { useEffect, useState, useCallback } from 'react';
import { StructureElement } from "entities/structure";
import {
    Button,
    Divider,
    IconButton,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import classNames from 'classnames';
import styles from "./style.module.scss";
import { useDispatch, useSelector } from 'react-redux';
import { getSelectedStructureElement } from '../../store/ConditionRating/selectors';
import * as actions from "../../store/ConditionRating/actions";
import PostAddIcon from '@mui/icons-material/PostAdd';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import { PayloadAction } from '@reduxjs/toolkit';
import RMADialog from '../ratingIFCElementTable/maintenanceActions/rmaDialog';
import RatingComponent from '../../components/ratingComponent';

interface AssessmentPanelProps {
    isSelected?: boolean;
    isTablet: boolean;
    onVisibilityChange?: () => void;
    className?: string;
}

const AssessmentPanel: React.FC<AssessmentPanelProps> = ({
    isSelected,
    isTablet,
    onVisibilityChange,
    className,
}) => {
    const dispatch = useDispatch();
    const [open, setOpen] = useState<boolean>(false);
    const selectedIFCElement = useSelector(getSelectedStructureElement);

    const addAssessmentOnClick = useCallback(() => {
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    const handleOnRatingChange = useCallback((value: string) => {
        if (!selectedIFCElement) return;

        const newRating = [0, 0, 0, 0];
        newRating[parseInt(value) - 1] = 1;

        dispatch({
            type: actions.SAVE_CONDITION_RATING_DATA,
            payload: { 
                ...selectedIFCElement, 
                condition: newRating, 
                ifcElementRatingValue: value 
            }
        } as PayloadAction<StructureElement>);
    }, [selectedIFCElement, dispatch]);

    // Reset state when selection changes
    useEffect(() => {
        if (!isSelected) {
            setOpen(false);
        }
    }, [isSelected]);

    return (
        <Paper 
            elevation={0} 
            sx={{ marginTop: 1 }}
            className={classNames(styles.assessmentPanel, className)}
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
                    isDisabled={!isSelected}
                    rating={selectedIFCElement?.ifcElementRatingValue || ''}
                    elementId={selectedIFCElement?.data?.expressID || -1}
                    handleOnRatingChange={handleOnRatingChange}
                />

                <Divider orientation="horizontal" flexItem />

                <Button 
                    variant="contained" 
                    endIcon={<PostAddIcon />} 
                    onClick={addAssessmentOnClick}
                    disabled={!isSelected}
                >
                    Add maintenance Action
                </Button>
            </Stack>

            <RMADialog
                handleClose={handleClose}
                modalState={open}
            />
        </Paper>
    );
};

export default AssessmentPanel;