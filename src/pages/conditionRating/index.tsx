import React, { useEffect, useState } from 'react'
import FormPageWrapper from '../../components/formPageWrapper';
import StructureElementGrid from './conditionRatingTable';
import { Button, IconButton, Stack, Typography } from '@mui/material';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import { useNavigationManager } from '../../navigation';
import { RoutesValueEnum } from '../../enums';
import { useSelector } from 'react-redux';
import { getCurrentStructure } from '../../store/Structure/selectors';
import { isOnlineSelector } from '../../store/SystemAvailability/selectors';
import { hasIFCFile } from '../../helper/db';

const ConditionRating: React.FC = () => {
    const { goTo } = useNavigationManager();
    const currentStructure = useSelector(getCurrentStructure);
    const isOnline = useSelector(isOnlineSelector);
    const [show3DButton, setShow3DButton] = useState(true);

    const handleClick = () => {
        goTo(RoutesValueEnum.IFCViewer);
    };

    useEffect(() => {
        const checkIFCAvailability = async () => {
            if (!currentStructure?.ifcfileaddress) {
                setShow3DButton(false);
                return;
            }

            if (!isOnline) {
                // Check if we have the file locally
                const hasLocal = await hasIFCFile(currentStructure.id);
                setShow3DButton(hasLocal);
            } else {
                setShow3DButton(true);
            }
        };

        checkIFCAvailability();
    }, [currentStructure, isOnline]);

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