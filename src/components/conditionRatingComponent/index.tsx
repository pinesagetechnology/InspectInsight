import React from 'react'
import { Paper, Stack, TextField, styled } from '@mui/material';
import { StructureElement } from '../../entities/structure';
import styles from "./style.module.scss";

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    ...theme.applyStyles('dark', {
        backgroundColor: '#1A2027',
    }),
    width: '60px'
}));

interface ConditionRatingComponentProps {
    element: StructureElement
    editModeFlag: boolean
    handleConditionChange: (
        event: React.ChangeEvent<HTMLInputElement>,
        elementId: number,
        index: number
    ) => void;
}

const ConditionRatingComponent: React.FC<ConditionRatingComponentProps> = ({
    element,
    editModeFlag,
    handleConditionChange
}) => {

    return (
        <Stack direction="row" spacing={1}>
            {[0, 1, 2, 3].map((_, index) => {
                const fieldValue = (element.condition && element.condition[index]) ? element.condition[index] : 0;
                const focusedKey = `${element?.data?.expressID}-${index}`;
                return (editModeFlag) ? (
                    <TextField
                        key={focusedKey}
                        size="small"
                        variant="outlined"
                        margin="none"
                        value={fieldValue}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleConditionChange(e, element.data.expressID, index)
                        }
                        className={styles.conditionTextBox}
                    />
                ) : (
                    <Item key={focusedKey}>{fieldValue}</Item>
                );
            })}
        </Stack>
    )
}

export default ConditionRatingComponent;