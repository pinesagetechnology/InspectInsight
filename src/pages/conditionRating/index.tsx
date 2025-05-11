import React, { useEffect, useState } from 'react'
import { Button } from '@mui/material';
import FormPageWrapper from '../../components/formPageWrapper';
import StructureElementGrid from '../../components/ratingIFCElementTable';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import { useNavigationManager } from '../../navigation';
import { RoutesValueEnum } from '../../enums';
import { useSelector } from 'react-redux';
import { getCurrentStructure, getStructureElements } from '../../store/Structure/selectors';
import { isOnlineSelector } from '../../store/SystemAvailability/selectors';
import { hasIFCFile } from '../../helper/db';
import ElementsCodeGrid from '../../components/ratingElementCodeTable';
import { getOriginalConditionRating, getElementCodeDataList } from '../../store/ConditionRating/selectors';

const ConditionRating: React.FC = () => {
    const { goTo } = useNavigationManager();
    const currentStructure = useSelector(getCurrentStructure);

    const structureElements = useSelector(getOriginalConditionRating);
    const elementsCodeData = useSelector(getElementCodeDataList);
console.log('elementsCodeData', elementsCodeData);
console.log('structureElements', structureElements);
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
                {show3DButton &&
                    <Button variant="outlined" startIcon={<ViewInArIcon />} onClick={() => handleClick()}>
                        3D View
                    </Button>
                }
                {structureElements?.length > 0 &&
                    <StructureElementGrid />
                }

                {elementsCodeData?.length > 0 &&
                    <ElementsCodeGrid />
                }

            </div>
        </FormPageWrapper>
    )
}

export default ConditionRating;