import React, { useEffect, useState } from 'react';
import { StructureElement } from "entities/structure";
import { Divider, IconButton, Paper, Stack, Typography, TextField, styled, Tooltip } from "@mui/material";
import classNames from 'classnames';
import styles from "./style.module.scss";
import { useDispatch, useSelector } from 'react-redux';
import { getDisplayElementList, getSelectedStructureElement } from '../../store/ConditionRating/selectors';
import * as actions from "../../store/ConditionRating/actions";
import PostAddIcon from '@mui/icons-material/PostAdd';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import { PayloadAction } from '@reduxjs/toolkit';
import RMADialog from '../../pages/conditionRating/rmaDialog';

interface AssessmentPanelProps {
    showConditionPanel?: boolean;
    isSelected?: boolean;
}
const AssessmentPanel: React.FC<AssessmentPanelProps> = ({
    showConditionPanel,
    isSelected
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

    const updateStructureElement = (newConditions: number[]) => {
        const updatedElement = { ...currentStructureElelement, condition: newConditions };
        const newData = displayElements.map((item) => {
            if (item.data.expressID === updatedElement.data.expressID) {
                return { ...item, condition: newConditions };
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

    const handleConditionChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        index: number
    ) => {
        const { value } = event.target;

        // Remove non-digit characters
        const onlyNums = value.replace(/[^0-9]/g, "");

        if (onlyNums) {
            const num = parseInt(onlyNums, 10);
            if (num >= 1 && num <= 4) {
                // Create new conditions array with updated value at the target index
                const newConditions = [0, 1, 2, 3].map((i) =>
                    i === index
                        ? num
                        : currentStructureElelement.condition && currentStructureElelement.condition[i]
                            ? currentStructureElelement.condition[i]
                            : 0
                );
                updateStructureElement(newConditions);
            }
        } else {
            // Input cleared or invalid: update only the specified index to 0
            const currentConditions = currentStructureElelement.condition || [0, 0, 0, 0];
            const newConditions = [...currentConditions];
            newConditions[index] = 0;
            updateStructureElement(newConditions);
        }
    };


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

    return (
        <React.Fragment>
            <style>{`.${classNames(styles.assessmentPanel)} { display: ${showConditionPanel ? 'block' : 'none'}; }`}</style>
            <RMADialog
                handleClose={handleClose}
                modalState={open}
            />

            <Paper elevation={0} className={styles.assessmentPanel}>
                <Typography variant="h6">Condition Rating Form</Typography>
                <Divider orientation="horizontal" flexItem  className={styles.divider}/>
                
                <Stack direction="row" spacing={1}>
                    {[0, 1, 2, 3].map((_, index) => {
                        const fieldValue = (currentStructureElelement.condition && currentStructureElelement.condition[index]) ? currentStructureElelement.condition[index] : 0;
                        const focusedKey = `${currentStructureElelement?.data?.expressID}-${index}`;
                        return (<TextField
                            key={focusedKey}
                            size="small"
                            variant="outlined"
                            margin="none"
                            value={fieldValue}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleConditionChange(e, index)
                            }
                            className={styles.conditionTextBox}
                            disabled={!isSelected}
                        />)
                    })}
                </Stack>

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