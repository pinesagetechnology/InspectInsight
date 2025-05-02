import React from 'react'
import FormPageWrapper from '../../components/formPageWrapper';
import StructureElementGrid from './conditionRatingTable';
import { IconButton, Stack, Typography } from '@mui/material';
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
                <Stack direction={'row'} spacing={2}>
                    <IconButton aria-label="delete" size="large" onClick={() => handleClick()}>
                        <ViewInArIcon fontSize="inherit" />
                    </IconButton>
                    <Typography variant="body1" sx={{ alignSelf: 'center' }}>
                        3D View
                    </Typography>
                </Stack>
                <StructureElementGrid />
            </div>
        </FormPageWrapper>
    )
}

export default ConditionRating;