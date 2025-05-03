import React from 'react'
import FormPageWrapper from '../../components/formPageWrapper';
import StructureElementGrid from './conditionRatingTable';
import { Button, IconButton, Stack, Typography } from '@mui/material';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import { useNavigationManager } from '../../navigation';
import { RoutesValueEnum } from '../../enums';

const ConditionRating: React.FC = () => {
    const { goTo } = useNavigationManager();

    const handleClick = () => {
        goTo(RoutesValueEnum.IFCViewer);
    };

    return (
        <FormPageWrapper isFooterVisible={true}>
            <div style={{ width: '100%' }}>
                <Button variant="outlined" startIcon={<ViewInArIcon />} onClick={() => handleClick()}>
                    3D View
                </Button>
                <StructureElementGrid />
            </div>
        </FormPageWrapper>
    )
}

export default ConditionRating;