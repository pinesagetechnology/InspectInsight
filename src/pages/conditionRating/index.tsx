import React, { useState } from 'react'
import FormPageWrapper from '../../components/formPageWrapper';
import StructureElementGrid from './conditionRatingTable';
import { PayloadAction } from '@reduxjs/toolkit';
import * as actions from "../../store/ConditionRating/actions";
import * as commonActions from "../../store/Common/actions";
import { useDispatch, useSelector } from 'react-redux';
import { StructureElement } from '../../entities/structure';
import { getElementHistory } from '../../store/ConditionRating/selectors';
import { Button, FormControlLabel, Stack, Switch } from '@mui/material';
import IFCViewerComponent from '../../components/ifcViewerComponent';


const ConditionRating: React.FC = () => {
    const dispatch = useDispatch();
    const elementHistory: StructureElement[][] = useSelector(getElementHistory);
    const [checked, setChecked] = useState<boolean>(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({
            type: commonActions.SHOW_LOADING_OVERLAY
        });
        setChecked(event.target.checked);
    };

    const handleBack = () => {
        dispatch({
            type: actions.HANDLE_BACK_CLICK_SAGA
        } as PayloadAction);
    };


    return (
        <FormPageWrapper>
            <div style={{ width: '100%' }}>
                <Stack direction={'row'} spacing={2}>
                    {elementHistory.length > 0 && (
                        <Button onClick={handleBack} style={{ margin: '10px' }}>Go Back</Button>
                    )}
                    <FormControlLabel control={<Switch onChange={handleChange} checked={checked} />} label="3D viewer" />
                </Stack>
                {
                    checked ?
                        <IFCViewerComponent />
                        :
                        <StructureElementGrid />
                }
            </div>
        </FormPageWrapper>
    )
}

export default ConditionRating;