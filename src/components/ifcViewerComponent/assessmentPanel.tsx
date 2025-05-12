import React, { useEffect, useState } from 'react';
import { StructureElement } from "entities/structure";
import { Divider, IconButton, Paper, Stack, Typography, TextField, styled, Tooltip, Box, ToggleButtonGroup, ToggleButton } from "@mui/material";
import classNames from 'classnames';
import styles from "./style.module.scss";
import { useDispatch, useSelector } from 'react-redux';
import { getDisplayElementList, getSelectedStructureElement } from '../../store/ConditionRating/selectors';
import * as actions from "../../store/ConditionRating/actions";
import PostAddIcon from '@mui/icons-material/PostAdd';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import { PayloadAction } from '@reduxjs/toolkit';
import RMADialog from '../ratingIFCElementTable/maintenanceActions/rmaDialog';
import CloseIcon from '@mui/icons-material/Close';

interface AssessmentPanelProps {
    showConditionPanel?: boolean;
    isSelected?: boolean;
    isTablet: boolean;
    closeConditionPanelHandler: () => void;
}
const AssessmentPanel: React.FC<AssessmentPanelProps> = ({
    showConditionPanel,
    isSelected,
    isTablet,
    closeConditionPanelHandler
}) => {
    const dispatch = useDispatch();

    const [originalCondition, setOriginalCondition] = useState<number[]>([]);
    const [currentStructureElelement, setCurrentStructureElement] = useState<StructureElement>({} as StructureElement);
    const [open, setOpen] = useState<boolean>(false);

    const displayElements = useSelector(getDisplayElementList);
    const structureElement = useSelector(getSelectedStructureElement);

    useEffect(() => {
        if (structureElement) {
            setOriginalCondition(structureElement?.condition || []);
            setCurrentStructureElement(structureElement);
        }
    }, [structureElement])

    const updateStructureElement = (newConditions: number[], ifcElementRatingValue: string) => {
        const updatedElement = { ...currentStructureElelement, condition: newConditions, ifcElementRatingValue: ifcElementRatingValue };
        const newData = displayElements.map((item) => {
            if (item.data.expressID === updatedElement.data.expressID) {
                return { ...item, condition: newConditions, ifcElementRatingValue: ifcElementRatingValue };
            }
            return item;
        });

        setCurrentStructureElement(() => {
            dispatch({
                payload: newData,
                type: actions.UPDATE_DISPLAY_LIST_ITEMS,
            });
            return updatedElement;
        });
    }

    const saveOnClick = () => {
        if (!currentStructureElelement) return;

        dispatch({
            type: actions.SAVE_CONDITION_RATING_DATA,
            payload: currentStructureElelement
        } as PayloadAction<StructureElement>);
    }

    const cancelOnClick = () => {
        if (!currentStructureElelement) return;

        const newData = displayElements.map((item) => {
            if (item.data.expressID === currentStructureElelement.data.expressID) {
                return { ...item, condition: originalCondition };
            }
            return item;
        });

        dispatch({
            payload: newData,
            type: actions.UPDATE_DISPLAY_LIST_ITEMS
        } as PayloadAction<StructureElement[]>);
    }

    const addAssessmentOnClick = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleOnRatingChange = (
        event: React.MouseEvent<HTMLElement>,
        value: string,
        elementId: number
    ) => {
        const newRating = [0, 0, 0, 0];
        newRating[parseInt(value) - 1] = 1;

        const newData = displayElements.map((item) => {
            if (item.data.expressID === elementId) {
                return { ...item, ifcElementRatingValue: value, condition: newRating };
            }
            return item;
        });
        updateStructureElement(newRating, value);
    };

    return (
        <React.Fragment>
            <style>{`.${classNames(styles.assessmentPanel)} { display: ${showConditionPanel ? 'block' : 'none'}; }`}</style>
            <RMADialog
                handleClose={handleClose}
                modalState={open}
            />

            <Paper elevation={0} className={styles.assessmentPanel}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    width: '100%',
                    mb: 1
                }}>
                    <IconButton
                        size="small"
                        onClick={() => closeConditionPanelHandler()}
                        sx={{
                            display: 'flex'
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Typography variant="h6">Condition Rating Form</Typography>
                <Divider orientation="horizontal" flexItem className={styles.divider} />
                <Stack>
                    <Typography variant='caption'>Element Name</Typography>
                    <Typography variant='body2'>{structureElement?.data?.Name}</Typography>
                </Stack>

                <Divider orientation="horizontal" flexItem className={styles.divider} />

                <ToggleButtonGroup value={currentStructureElelement.ifcElementRatingValue}
                    onChange={(event: React.MouseEvent<HTMLElement>,
                        value: string,) => handleOnRatingChange(event, value, currentStructureElelement.data.expressID)}
                    aria-label="Medium sizes"
                    exclusive={true}>
                    <ToggleButton value="1" key="CS1">
                        CS1
                    </ToggleButton>,
                    <ToggleButton value="2" key="CS2">
                        CS2
                    </ToggleButton>,
                    <ToggleButton value="3" key="CS3">
                        CS3
                    </ToggleButton>,
                    <ToggleButton value="4" key="CS4">
                        CS4
                    </ToggleButton>,
                </ToggleButtonGroup>

                <Divider orientation="horizontal" flexItem />
                
                <React.Fragment>
                    <IconButton
                        color="success"
                        onClick={() => saveOnClick()}
                        disabled={!isSelected}
                        className={styles.menuButtonSize}>
                        <SaveIcon />
                    </IconButton>

                    <IconButton
                        color="secondary"
                        onClick={() => cancelOnClick()}
                        disabled={!isSelected}
                        className={styles.menuButtonSize}>
                        <CancelIcon />
                    </IconButton>

                    <IconButton
                        color="primary"
                        onClick={() => addAssessmentOnClick()}
                        disabled={!isSelected}
                        className={styles.menuButtonSize}>
                        <PostAddIcon />
                    </IconButton>
                </React.Fragment>

            </Paper>
        </React.Fragment>
    );
};

export default AssessmentPanel;