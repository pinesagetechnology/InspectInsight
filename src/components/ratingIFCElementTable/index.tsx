import React, { useEffect, useState } from 'react';
import { PayloadAction } from '@reduxjs/toolkit';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Stack,
    TextField,
    styled,
    IconButton,
    Tooltip,
    Grid2 as Grid,
    useMediaQuery,
    Box,
    ToggleButtonGroup,
    ToggleButton,
    Typography
} from '@mui/material';
import { useSelector } from 'react-redux';
import { StructureElement } from '../../entities/structure';
import { getDisplayElementList } from '../../store/ConditionRating/selectors';
import styles from './style.module.scss';
import { useDispatch } from 'react-redux';
import * as actions from "../../store/ConditionRating/actions";
import RMADialog from './maintenanceActions/rmaDialog';
import PostAddIcon from '@mui/icons-material/PostAdd';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import SearchBarComponent from '../ifcTreeComponent.tsx/searchBar';
import { getElementHistory } from '../../store/ConditionRating/selectors';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { filterTree } from '../../helper/ifcTreeManager';
import RatingComponent from '../../components/ratingComponent';

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

const StyledTableHeaderCell = styled(StyledTableCell)(({ theme }) => ({
    backgroundColor: theme.palette.grey[100],
    fontWeight: 600,
    color: theme.palette.text.primary,
    whiteSpace: 'nowrap'
}));

const StructureElementGrid: React.FC = () => {
    const displayElements: StructureElement[] = useSelector(getDisplayElementList);
    const elementHistory: StructureElement[][] = useSelector(getElementHistory);
    const [open, setOpen] = useState<boolean>(false);

    const [selectedElement, setSelectedElement] = useState<StructureElement>({} as StructureElement);
    const [editRowId, setEditRowId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [goBackLabel, setGoBackLabel] = useState<string>('');

    // Responsive breakpoints
    const isTablet = useMediaQuery('(max-width:960px)');
    const isPortrait = useMediaQuery('(max-width:600px)');

    const filteredTreeData = searchQuery ? filterTree(displayElements, searchQuery) : displayElements;

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch({
            type: actions.RESET_CONDITION_RATING_DISPLAY_TABLE
        } as PayloadAction)
    }, [])

    useEffect(() => {
        setGoBackLabel(elementHistory.length > 0 ? elementHistory[elementHistory.length - 1][0].data.Entity : '');
    }, [elementHistory])

    const handleSaveButton = (item: StructureElement) => {
        dispatch({
            type: actions.SAVE_CONDITION_RATING_DATA,
            payload: item
        } as PayloadAction<StructureElement>)
        setEditRowId(null);
    }

    const handleEditButton = (id: number) => {
        setEditRowId(editRowId === id ? null : id);
        const selectedElement = displayElements.find(el => el.data.expressID === id);
        if (selectedElement) {
            setSelectedElement(selectedElement);
        }
    }

    const handleRowClick = (element: StructureElement) => {
        dispatch({
            payload: element,
            type: actions.HANDLE_ROW_CLICK_SAGA
        } as PayloadAction<StructureElement>);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const addAssessmentOnClick = (element: StructureElement) => (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        dispatch({
            type: actions.SET_SELECTED_STRUCTURE_ELEMENT,
            payload: element
        } as PayloadAction<StructureElement>);

        setOpen(true);
    }

    const cancelOnClick = (elementId: number) => (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        setEditRowId(null);
        const newData = displayElements.map((item) => {
            if (item.data.expressID === elementId) {
                return { ...item, condition: selectedElement.condition, ifcElementRatingValue: selectedElement.ifcElementRatingValue };
            }
            return item;
        });

        dispatch({
            payload: newData,
            type: actions.UPDATE_DISPLAY_LIST_ITEMS
        } as PayloadAction<StructureElement[]>);
    }

    const editOnClick = (elementId: number) => (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        handleEditButton(elementId)
    }

    const saveOnClick = (element: StructureElement) => (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        handleSaveButton(element);
    }

    const handleBack = () => {
        dispatch({
            type: actions.HANDLE_BACK_CLICK_SAGA
        } as PayloadAction);
    }

    const handleOnRatingChange = (
        value: string,
        elementId: number
    ) => {
        console.log(value, elementId);
        const newRating = [0, 0, 0, 0];
        newRating[parseInt(value) - 1] = 1;

        const newData = displayElements.map((item) => {
            if (item.data.expressID === elementId) {
                return { ...item, ifcElementRatingValue: value, condition: newRating };
            }
            return item;
        });

        dispatch({
            payload: newData,
            type: actions.UPDATE_DISPLAY_LIST_ITEMS
        });
    };

    return (
        <React.Fragment>
            <RMADialog
                handleClose={handleClose}
                modalState={open}
            />
            <Stack direction={'column'}>
                <Grid
                    container
                    sx={{
                        margin: isPortrait ? '10px 0' : '10px 5px'
                    }}
                    spacing={isPortrait ? 1 : 2}
                    direction={isPortrait ? 'column' : 'row'}
                >
                    <Grid size={isPortrait ? 12 : 6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', maxWidth: isPortrait ? '100%' : '400px' }}>
                            <SearchBarComponent onSearchChange={setSearchQuery} searchQuery={searchQuery} />
                        </Box>
                    </Grid>
                    <Grid size={isPortrait ? 12 : 6} sx={{ display: 'flex', alignItems: 'center', justifyContent: isPortrait ? 'flex-start' : 'flex-end' }}>
                        {elementHistory.length > 0 && (
                            <Button
                                onClick={handleBack}
                                startIcon={<KeyboardReturnIcon />}
                                color="primary"
                                size={isPortrait ? 'small' : 'medium'}
                            >
                                {`Go Back to ${goBackLabel}`}
                            </Button>
                        )}
                    </Grid>
                </Grid>

                <TableContainer
                    component={Paper}
                    sx={{
                        mt: 2,
                        maxHeight: isTablet ? '60vh' : '70vh'
                    }}
                >
                    <Table stickyHeader aria-label="collapsible table">
                        <TableHead>
                            <TableRow>
                                <StyledTableHeaderCell sx={{ display: isPortrait ? 'none' : 'table-cell' }}>ID</StyledTableHeaderCell>
                                <StyledTableHeaderCell>Entity</StyledTableHeaderCell>
                                <StyledTableHeaderCell>Name</StyledTableHeaderCell>
                                <StyledTableHeaderCell sx={{ display: isPortrait ? 'none' : 'table-cell' }}>Quantity</StyledTableHeaderCell>
                                <StyledTableHeaderCell sx={{ textAlign: 'center' }} >
                                    Condition rating
                                    <Stack direction={'column'}>
                                        <Stack direction={'row'} spacing={0} sx={{ justifyContent: 'space-between', width: '100%' }}>
                                            {[1, 2, 3, 4].map((rating) => (
                                                <Box key={rating} sx={{ width: '25%', textAlign: 'center' }}>
                                                    <Typography variant="caption">
                                                        CS{rating}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Stack>
                                </StyledTableHeaderCell>
                                <StyledTableHeaderCell>Action</StyledTableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredTreeData?.map((element: StructureElement) => (
                                <TableRow key={element.data.expressID} onClick={() => handleRowClick(element)} style={{ cursor: 'pointer' }}>
                                    <StyledTableCell sx={{ display: isPortrait ? 'none' : 'table-cell' }}>{element.data.expressID}</StyledTableCell>
                                    <StyledTableCell>{element.data.Entity}</StyledTableCell>
                                    <StyledTableCell>{element.data.Name}</StyledTableCell>
                                    <StyledTableCell sx={{ display: isPortrait ? 'none' : 'table-cell' }}>
                                        {element.children?.length > 0 &&
                                            (element.quantity)
                                        }
                                    </StyledTableCell>

                                    <StyledTableCell className={styles.ratingConditionCell}>
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
                                                <React.Fragment>
                                                    {(editRowId === element.data.expressID) ?
                                                        (<React.Fragment>
                                                            <Stack direction="row" spacing={1}>
                                                                <Tooltip title="Add assessment">
                                                                    <IconButton
                                                                        color="primary"
                                                                        onClick={addAssessmentOnClick(element)}
                                                                        size={isPortrait ? 'small' : 'medium'}
                                                                    >
                                                                        <PostAddIcon />
                                                                    </IconButton>
                                                                </Tooltip>

                                                                <Tooltip title="Save condition rating">
                                                                    <IconButton
                                                                        color="success"
                                                                        onClick={saveOnClick(element)}
                                                                        size={isPortrait ? 'small' : 'medium'}
                                                                    >
                                                                        <SaveIcon />
                                                                    </IconButton>
                                                                </Tooltip>

                                                                <Tooltip title="Cancel condition rating">
                                                                    <IconButton
                                                                        color="secondary"
                                                                        onClick={cancelOnClick(element.data.expressID)}
                                                                        size={isPortrait ? 'small' : 'medium'}
                                                                    >
                                                                        <CancelIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Stack>
                                                        </React.Fragment>)
                                                        :
                                                        (
                                                            <Button
                                                                variant="contained"
                                                                color="secondary"
                                                                startIcon={<TroubleshootIcon />}
                                                                disabled={(!!editRowId && element.data.expressID !== editRowId)}
                                                                onClick={editOnClick(element.data.expressID)}
                                                                size={isPortrait ? 'small' : 'medium'}
                                                            >
                                                                {isPortrait ? 'Rate' : 'Add rating'}
                                                            </Button>
                                                        )
                                                    }
                                                </React.Fragment>
                                            )}
                                        </Stack>
                                    </StyledTableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Stack>
        </React.Fragment>
    );
};

export default StructureElementGrid;