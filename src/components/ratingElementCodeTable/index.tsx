import React, { useState, useCallback, useMemo } from 'react';
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
    IconButton,
    Tooltip,
    Grid2 as Grid,
    useMediaQuery,
    Box,
    Typography,
    styled
} from '@mui/material';
import { useSelector } from 'react-redux';
import { ElementCodeData } from '../../entities/structure';
import { useDispatch } from 'react-redux';
import * as actions from "../../store/ConditionRating/actions";
import RMADialog from './maintenanceActions/rmaDialog';
import PostAddIcon from '@mui/icons-material/PostAdd';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import SearchBarComponent from '../ifcTreeComponent.tsx/searchBar';
import { getElementCodeDataList } from '../../store/ConditionRating/selectors';
import RatingInputField from '../ratingInputField';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(0.5),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    width: '50px',
    '@media (max-width: 600px)': {
        width: '40px',
        fontSize: '0.75rem'
    }
}));

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

const ElementsCodeGrid: React.FC = () => {
    const dispatch = useDispatch();
    const structureElementsCode = useSelector(getElementCodeDataList);

    // Local state for editing
    const [editingElements, setEditingElements] = useState<Map<string, ElementCodeData>>(new Map());
    const [editRowId, setEditRowId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [open, setOpen] = useState<boolean>(false);

    // Responsive breakpoints
    const isTablet = useMediaQuery('(max-width:960px)');
    const isPortrait = useMediaQuery('(max-width:600px)');

    // Memoize filtered data
    const filteredElementCodeData = useMemo(() => {
        if (!searchQuery) return structureElementsCode;

        return structureElementsCode.filter(item =>
            item.elementCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [structureElementsCode, searchQuery]);

    // Get current data for an element (either from editing state or original)
    const getCurrentElementData = useCallback((elementCode: string): ElementCodeData => {
        if (editRowId === elementCode && editingElements.has(elementCode)) {
            return editingElements.get(elementCode)!;
        }
        return structureElementsCode.find(item => item.elementCode === elementCode) ||
            filteredElementCodeData.find(item => item.elementCode === elementCode)!;
    }, [editRowId, editingElements, structureElementsCode, filteredElementCodeData]);

    const handleConditionChange = useCallback((element: ElementCodeData, index: number, value: number) => {
        const currentElement = editRowId === element.elementCode && editingElements.has(element.elementCode)
            ? editingElements.get(element.elementCode)!
            : element;

        const newCondition = [...(currentElement.condition || [0, 0, 0, 0])];
        newCondition[index] = value;

        const updatedElement = { ...currentElement, condition: newCondition };
        setEditingElements(prev => new Map(prev).set(element.elementCode, updatedElement));
    }, [editRowId, editingElements]);

    const handleEditButton = useCallback((code: string) => {
        if (editRowId === code) {
            // Cancel editing
            setEditRowId(null);
            setEditingElements(prev => {
                const newMap = new Map(prev);
                newMap.delete(code);
                return newMap;
            });
        } else {
            // Start editing
            setEditRowId(code);
            const element = structureElementsCode.find(item => item.elementCode === code);
            if (element) {
                setEditingElements(prev => new Map(prev).set(code, { ...element }));
            }
        }
    }, [editRowId, structureElementsCode]);

    const handleSave = useCallback((elementCode: string) => {
        const editedElement = editingElements.get(elementCode);
        if (!editedElement) return;

        // Update the global state with all changes
        const updatedData = structureElementsCode.map(item =>
            item.elementCode === elementCode ? editedElement : item
        );

        dispatch({
            type: actions.UPDATE_ELEMENT_CODE_LIST,
            payload: updatedData
        });

        // Clean up local state
        setEditRowId(null);
        setEditingElements(prev => {
            const newMap = new Map(prev);
            newMap.delete(elementCode);
            return newMap;
        });
    }, [editingElements, structureElementsCode, dispatch]);

    const handleCancel = useCallback((elementCode: string) => {
        setEditRowId(null);
        setEditingElements(prev => {
            const newMap = new Map(prev);
            newMap.delete(elementCode);
            return newMap;
        });
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    const addAssessmentOnClick = useCallback((element: ElementCodeData) => (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        dispatch({
            type: actions.SET_SELECTED_ELEMENT_CODE,
            payload: element
        } as PayloadAction<ElementCodeData>);
        setOpen(true);
    }, [dispatch]);

    const saveOnClick = useCallback((element: ElementCodeData) => (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        handleSave(element.elementCode);

        // Dispatch save action for persistence
        dispatch({
            type: actions.SAVE_ELEMENT_CODE_LIST,
        } as PayloadAction);
    }, [handleSave, dispatch]);

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
                                <StyledTableHeaderCell sx={{ display: isPortrait ? 'none' : 'table-cell' }}>Code</StyledTableHeaderCell>
                                <StyledTableHeaderCell>Description</StyledTableHeaderCell>
                                <StyledTableHeaderCell sx={{ display: isPortrait ? 'none' : 'table-cell' }}>Total Qty</StyledTableHeaderCell>
                                <StyledTableHeaderCell>Unit</StyledTableHeaderCell>
                                <StyledTableHeaderCell sx={{ textAlign: 'center', width: '250px' }} >
                                    Condition rating
                                    <Stack direction={'column'} sx={{ width: '250px' }}>
                                        <Stack direction="row" spacing={0} sx={{ width: '100%', justifyContent: 'space-between' }}>
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
                            {filteredElementCodeData?.map((element: ElementCodeData) => {
                                const currentData = getCurrentElementData(element.elementCode);
                                const isEditing = editRowId === element.elementCode;

                                return (
                                    <TableRow key={element.elementCode} style={{ cursor: 'pointer' }}>
                                        <StyledTableCell sx={{ display: isPortrait ? 'none' : 'table-cell' }}>
                                            {element.elementCode}
                                        </StyledTableCell>
                                        <StyledTableCell>{element.description}</StyledTableCell>
                                        <StyledTableCell sx={{ display: isPortrait ? 'none' : 'table-cell' }}>
                                            {element.totalQty}
                                        </StyledTableCell>
                                        <StyledTableCell>{element.unit}</StyledTableCell>

                                        <StyledTableCell sx={{ width: '250px', textAlign: 'center' }}>
                                            <Stack direction="row" spacing={isPortrait ? 0.5 : 1}>
                                                {[0, 1, 2, 3].map((index) => {
                                                    const fieldValue = (currentData.condition && currentData.condition[index]) ? currentData.condition[index] : 0;
                                                    const otherValues = currentData.condition || [0, 0, 0, 0];

                                                    return (
                                                        <Grid container key={`stack-${element.elementCode}-${index}`}>
                                                            <Grid size={3}>
                                                                {isEditing ? (
                                                                    <RatingInputField
                                                                        value={fieldValue}
                                                                        onChange={(value) => handleConditionChange(element, index, value)}
                                                                        index={index}
                                                                        totalQty={parseInt(element.totalQty, 10)}
                                                                        otherValues={otherValues}
                                                                    />
                                                                ) : (
                                                                    <Item>{fieldValue}</Item>
                                                                )}
                                                            </Grid>
                                                        </Grid>
                                                    );
                                                })}
                                            </Stack>
                                        </StyledTableCell>

                                        <StyledTableCell>
                                            <Stack direction={isPortrait ? 'column' : 'row'} spacing={1}>
                                                {isEditing ? (
                                                    <React.Fragment>
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
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleCancel(element.elementCode);
                                                                    }}
                                                                    size={isPortrait ? 'small' : 'medium'}
                                                                >
                                                                    <CancelIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Stack>
                                                    </React.Fragment>
                                                ) : (
                                                    <Button
                                                        variant="contained"
                                                        color="secondary"
                                                        startIcon={<TroubleshootIcon />}
                                                        disabled={!!editRowId && element.elementCode !== editRowId}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditButton(element.elementCode);
                                                        }}
                                                        size={isPortrait ? 'small' : 'medium'}
                                                    >
                                                        {isPortrait ? 'Rate' : 'Add rating'}
                                                    </Button>
                                                )}
                                            </Stack>
                                        </StyledTableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Stack>
        </React.Fragment>
    );
};

export default ElementsCodeGrid;