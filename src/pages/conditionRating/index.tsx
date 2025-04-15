import React, { useState } from 'react'
import FormPageWrapper from '../../components/formPageWrapper';
import StructureElementGrid from './conditionRatingTable';
import * as commonActions from "../../store/Common/actions";
import { useDispatch } from 'react-redux';
import { FormControlLabel, Stack, Switch } from '@mui/material';
import IFCViewerComponent from '../../components/ifcViewerComponent';


const ConditionRating: React.FC = () => {
    const dispatch = useDispatch();
    const [checked, setChecked] = useState<boolean>(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            dispatch({
                type: commonActions.SHOW_LOADING_OVERLAY
            });
        }
        setChecked(event.target.checked);
    };

    return (
        <FormPageWrapper isFooterVisible={true}>
            <div style={{ width: '100%' }}>
                <Stack direction={'row'} spacing={2}>
                    <FormControlLabel control={<Switch onChange={handleChange} checked={checked} />} label="Switch to 3D viewer" />
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