import React from 'react';
import {
    TableCell,
    TableRow,
    Stack,
    styled,
    IconButton,
    Tooltip,
    Badge
} from '@mui/material';
import { StructureElement } from '../../entities/structure';
import PostAddIcon from '@mui/icons-material/PostAdd';
import RatingComponent from '../../components/ratingComponent';
import { MaintenanceActionModel } from '../../models/inspectionModel';
import SaveIcon from '@mui/icons-material/Save';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
    padding: '12px 16px',
    fontSize: '14px',
    '@media (max-width: 960px)': {
        padding: '8px 12px',
        fontSize: '13px',
    },
    '@media (max-width: 600px)': {
        padding: '6px 8px',
        fontSize: '12px',
    }
}));

const TableRowComponent = React.memo(({
    element,
    selectedElement,
    isPortrait,
    handleRowClick,
    handleRowDoubleClick,
    handleOnRatingChange,
    handleSaveButton,
    addAssessmentOnClick,
    maintenanceActionList
}: {
    element: StructureElement;
    selectedElement: StructureElement | null;
    isPortrait: boolean;
    handleRowClick: (element: StructureElement) => void;
    handleRowDoubleClick: (element: StructureElement) => void;
    handleOnRatingChange: (value: string, elementId: number) => void;
    handleSaveButton: (element: StructureElement) => void;
    addAssessmentOnClick: (element: StructureElement) => (e: React.MouseEvent<HTMLButtonElement>) => void;
    maintenanceActionList: MaintenanceActionModel[];
}) => (
    <TableRow
        key={element.data?.expressID}
        onClick={() => handleRowClick(element)}
        onDoubleClick={() => handleRowDoubleClick(element)}
        style={{ cursor: 'pointer' }}
        data-express-id={element.data?.expressID}
        sx={{
            backgroundColor: selectedElement?.data?.expressID === element.data?.expressID ?
                'rgba(0, 0, 0, 0.04)' : 'inherit'
        }}
    >
        <StyledTableCell sx={{ display: isPortrait ? 'none' : 'table-cell' }}>{
            element.identityData && element.identityData.assetId ?
                element.identityData.assetId :
                element.data.expressID
        }</StyledTableCell>
        <StyledTableCell>{
            element.identityData && element.identityData.names ?
                element.identityData.names :
                element.data.Name
        }</StyledTableCell>
        <StyledTableCell>{element.identityData?.section}</StyledTableCell>
        <StyledTableCell sx={{ display: isPortrait ? 'none' : 'table-cell' }}>
            {element.children?.length > 0 && element.quantity}
        </StyledTableCell>
        <StyledTableCell>
            {!element.children?.length && (
                <RatingComponent
                    rating={element.ifcElementRatingValue || ''}
                    elementId={element.data.expressID}
                    handleOnRatingChange={handleOnRatingChange}
                />
            )}
        </StyledTableCell>
        <StyledTableCell>
            <Stack direction={isPortrait ? 'column' : 'row'} spacing={1}>
                {!element.children?.length && (
                    <Stack direction="row" spacing={1}>
                        <Tooltip title="Save condition rating">
                            <IconButton
                                color="success"
                                onClick={() => handleSaveButton(element)}
                                size={isPortrait ? 'small' : 'medium'}
                                disabled={element.isSaved}
                            >
                                <SaveIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Add maintenance action">
                            <Badge
                                badgeContent={maintenanceActionList.filter(
                                    (action) => action.elementId === element.data?.expressID.toString()
                                ).length}
                                color="primary"
                                showZero={false}
                                overlap="circular"
                                sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', minWidth: 16, height: 16 } }}
                            >
                                <IconButton
                                    color="primary"
                                    onClick={addAssessmentOnClick(element)}
                                    size={isPortrait ? 'small' : 'medium'}
                                >
                                    <PostAddIcon />
                                </IconButton>
                            </Badge>
                        </Tooltip>
                    </Stack>
                )}
            </Stack>
        </StyledTableCell>
    </TableRow>
));

export default TableRowComponent;