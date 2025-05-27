import React, { useEffect } from 'react'
import IFCViewerComponent from '../../components/ifcViewerComponent';
import FormPageWrapper from '../../components/formPageWrapper';
import { Button } from '@mui/material';
import { useNavigationManager } from '../../navigation';
import { RoutesValueEnum } from '../../enums';
import DatasetIcon from '@mui/icons-material/Dataset';
import * as commonActions from "../../store/Common/actions";
import { useDispatch } from 'react-redux';
import { PayloadAction } from '@reduxjs/toolkit';
import * as actions from "../../store/ConditionRating/actions";

const Viewer: React.FC = () => {
    const { goTo } = useNavigationManager();
    const dispatch = useDispatch();

    const handleClick = () => {
        const randomNumber = Math.floor(Math.random() * 10) + 1;
        dispatch({ type: actions.SET_AUTO_TABLE_ELEMENT_FOCUS, payload: randomNumber } as PayloadAction<number>);
        goTo(RoutesValueEnum.ConditionRating);
    };

    useEffect(() => {
        dispatch({ type: commonActions.SHOW_LOADING_OVERLAY } as PayloadAction);
    }, []);

    return (
        <FormPageWrapper isFooterVisible={true}>
            <div style={{ width: '100%' }}>
                <Button variant="outlined" startIcon={<DatasetIcon />} onClick={() => handleClick()}>
                    Table View
                </Button>
                <IFCViewerComponent />
            </div>
        </FormPageWrapper>
    )
}

export default Viewer;