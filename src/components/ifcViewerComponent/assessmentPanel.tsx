import React from 'react';
import { StructureElement } from "entities/structure";
import { Divider, IconButton, Paper, Stack, Typography } from "@mui/material";
import classNames from 'classnames';
import ConditionRatingComponent from '../conditionRatingComponent';
import styles from "./style.module.scss";

interface AssessmentPanelProps {
    showConditionPanel: boolean;
    element: StructureElement;
    handleConditionChange: (event: React.ChangeEvent<HTMLInputElement>,
        elementId: string,
        index: number) => void;
}
const AssessmentPanel: React.FC<AssessmentPanelProps> = ({
    showConditionPanel,
    element,
    handleConditionChange
}) => {
    return (
        <Paper elevation={0} className={classNames(styles.assessmentPanel, (showConditionPanel) ? styles.showAssessmentPanel : styles.hideAssessmentPanel)} >
            <Typography variant="h6">Assessment Panel</Typography>
            <Divider orientation="horizontal" flexItem />
            <Typography variant="subtitle2">Condition Rating</Typography>

            <ConditionRatingComponent
                editModeFlag={false}
                element={element}
                handleConditionChange={handleConditionChange} />

            <Divider orientation="horizontal" flexItem />


        </Paper>
    );
};

export default AssessmentPanel;