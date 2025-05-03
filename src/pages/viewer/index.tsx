import React, { useEffect } from 'react'
import IFCViewerComponent from '../../components/ifcViewerComponent';
import FormPageWrapper from '../../components/formPageWrapper';
import { Button, IconButton, Stack, Typography } from '@mui/material';
import { useNavigationManager } from '../../navigation';
import { RoutesValueEnum } from '../../enums';
import DatasetIcon from '@mui/icons-material/Dataset';
import * as commonActions from "../../store/Common/actions";
import { useDispatch } from 'react-redux';
import { PayloadAction } from '@reduxjs/toolkit';

const Viewer: React.FC = () => {
    const { goTo } = useNavigationManager();
    const dispatch = useDispatch();

    const handleClick = () => {
        goTo(RoutesValueEnum.ConditionRating);
    };

    useEffect(() => {
        dispatch({ type: commonActions.SHOW_LOADING_OVERLAY } as PayloadAction);
    }, []);

    return (
        <FormPageWrapper isFooterVisible={true}>
            <div style={{ width: '100%' }}>
                {/* <Stack direction={'row'} spacing={2}>
                    <IconButton aria-label="delete" size="large" onClick={() => handleClick()}>
                        <DatasetIcon fontSize="inherit" />
                    </IconButton>
                    <Typography variant="body1" sx={{ alignSelf: 'center' }}>
                        Table View
                    </Typography>
                    
                </Stack> */}
                <Button variant="outlined" startIcon={<DatasetIcon />} onClick={() => handleClick()}>
                    Table View
                </Button>
                <IFCViewerComponent />
            </div>
        </FormPageWrapper>
    )
}

export default Viewer;