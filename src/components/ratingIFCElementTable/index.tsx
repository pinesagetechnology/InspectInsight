import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
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
    styled,
    Grid2 as Grid,
    useMediaQuery,
    Box,
    Typography,
    Badge,
    TablePagination
} from '@mui/material';
import { useSelector } from 'react-redux';
import { StructureElement } from '../../entities/structure';
import {
    getAutoTableElementFocus,
    getDisplayElementList,
    getOriginalConditionRating,
    getRatedElements,
    getSelectedHierarchyPath,
    getSelectedStructureElement
} from '../../store/ConditionRating/selectors';
import { useDispatch } from 'react-redux';
import * as actions from "../../store/ConditionRating/actions";
import RMADialog from '../maintenanceActionsDialog/rmaDialog';
import SearchBarComponent from '../ifcTreeComponent.tsx/searchBar';
import { getElementHistory } from '../../store/ConditionRating/selectors';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { filterTree, findPathToNode } from '../../helper/ifcTreeManager';
import * as maintenanceActions from "../../store/MaintenanceAction/actions";
import { MaintenanceActionModel } from '../../models/inspectionModel';
import { getMaintenanceActionModalFlag, getMaintenanceActions } from '../../store/MaintenanceAction/selectors';
import { RMAModeEnum, RoutesValueEnum } from '../../enums';
import { useNavigationManager } from '../../navigation';
import * as commonActions from "../../store/Common/actions";
import { getTotalIFCElementQuantity } from '../../store/Structure/selectors';
import { CircularProgressWithLabel } from '../progressWithLableComponent';
import TableRowComponent from './tableRow';

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
    const { goTo } = useNavigationManager();
    const dispatch = useDispatch();
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const hasExecutedRef = useRef<number | null>(null);

    // Selectors
    const displayElements = useSelector(getDisplayElementList);
    const originalStructureElements = useSelector(getOriginalConditionRating);
    const totalIFCElementQuantity = useSelector(getTotalIFCElementQuantity);
    const elementHistory = useSelector(getElementHistory);
    const maintenanceActionModalFlag = useSelector(getMaintenanceActionModalFlag);
    const selectedElement = useSelector(getSelectedStructureElement);
    const autoTableElementFocus = useSelector(getAutoTableElementFocus);
    const ratedElements = useSelector(getRatedElements);
    const maintenanceActionList = useSelector(getMaintenanceActions);
    const selectedHierarchyPath = useSelector(getSelectedHierarchyPath);

    // Local state
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [goBackLabel, setGoBackLabel] = useState<string>('');
    const [hasManyChildren, setHasManyChildren] = useState<boolean>(false);
    const [paginatedChildren, setPaginatedChildren] = useState<StructureElement[]>([]);
    const [childPage, setChildPage] = useState(0);
    const [childRowsPerPage, setChildRowsPerPage] = useState(20);

    // Responsive breakpoints
    const isTablet = useMediaQuery('(max-width:962px)');
    const isPortrait = useMediaQuery('(orientation: portrait)');

    // Memoized filtered data
    const filteredTreeData = useMemo(() =>
        searchQuery ? filterTree(displayElements, searchQuery) : displayElements,
        [displayElements, searchQuery]
    );

    useEffect(() => {
        setHasManyChildren(filteredTreeData && filteredTreeData.length > 20);
        const startIndex = hasManyChildren ? childPage * childRowsPerPage : 0;
        const endIndex = hasManyChildren ? startIndex + childRowsPerPage : filteredTreeData?.length || 0;

        setPaginatedChildren(hasManyChildren ? filteredTreeData.slice(startIndex, endIndex) : filteredTreeData);
    }, [filteredTreeData, hasManyChildren, childPage, childRowsPerPage]);

    useEffect(() => {
        if (autoTableElementFocus < 0 || !selectedElement?.data) return;
        if (hasExecutedRef.current === autoTableElementFocus) return;

        hasExecutedRef.current = autoTableElementFocus;
        dispatch({ type: commonActions.SHOW_LOADING_OVERLAY });

        const pathList = findPathToNode(originalStructureElements, selectedElement.data.Name || '');
        const walkPath = async () => {
            try {
                for (const element of pathList) {
                    if (element.children?.length > 0) {
                        handleRowClick(element);
                        await new Promise(resolve => setTimeout(resolve, 120));
                    }
                }
            } catch (error) {
                console.error('Error in walkPath:', error);
            } finally {
                dispatch({ type: actions.SET_AUTO_TABLE_ELEMENT_FOCUS, payload: -1 });
            }
        };

        // Execute walkPath and then your other function
        (async () => {
            try {
                await walkPath();

                if (selectedElement?.originalIndex !== -1) {
                    if (selectedElement?.originalIndex !== undefined) {
                        const targetPage = Math.floor(selectedElement?.originalIndex / childRowsPerPage);

                        setChildPage(targetPage);

                        setTimeout(() => {
                            if (tableContainerRef.current && selectedElement?.data) {
                                const elementToScroll = tableContainerRef.current.querySelector(
                                    `[data-express-id="${selectedElement.data.expressID}"]`
                                );
                                if (elementToScroll) {
                                    elementToScroll.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                            }

                            dispatch({ type: commonActions.CLOSE_LOADING_OVERLAY });

                        }, 800);
                    }
                }
            } catch (error) {
                console.error('Error in walkPath:', error);
            }
        })();


    }, [autoTableElementFocus, selectedElement?.data, originalStructureElements, filteredTreeData, childRowsPerPage]);

    useEffect(() => {
        dispatch({
            type: actions.RESET_CONDITION_RATING_DISPLAY_TABLE
        } as PayloadAction);
    }, []);

    useEffect(() => {
        if (selectedHierarchyPath.length > 0) {
            const lastItem = selectedHierarchyPath[selectedHierarchyPath.length - 1];
            const label = lastItem.split('|')[0];
            setGoBackLabel(label);
        }
    }, [selectedHierarchyPath]);

    // Handlers
    const handleRowClick = useCallback((element: StructureElement) => {
        if (element.children?.length > 0) {

            dispatch({
                payload: element,
                type: actions.HANDLE_ROW_CLICK_SAGA
            } as PayloadAction<StructureElement>);
        }
    }, [dispatch]);

    const handleClose = useCallback(() => {
        dispatch({
            type: maintenanceActions.SET_MAINTENANCE_ACTION_MODAL_FLAG,
            payload: false
        } as PayloadAction<boolean>);
    }, [dispatch]);

    const addAssessmentOnClick = useCallback((element: StructureElement) => (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        dispatch({
            type: actions.SET_SELECTED_STRUCTURE_ELEMENT,
            payload: element
        } as PayloadAction<StructureElement>);

        const newMaintenanceAction = {
            id: "-1",
            isSectionExpanded: true,
            dateForCompletion: new Date().toISOString(),
            elementCode: element.data?.Name || "",
            elementDescription: element.data?.Entity || "",
            elementId: element.data.expressID.toString(),
            mode: 1
        } as MaintenanceActionModel;

        dispatch({
            type: maintenanceActions.ADD_NEW_ITEM,
            payload: newMaintenanceAction
        } as PayloadAction<MaintenanceActionModel>);
    }, [dispatch]);

    const handleBack = useCallback(() => {
        dispatch({
            type: actions.SET_SELECTED_STRUCTURE_ELEMENT,
            payload: {} as StructureElement
        } as PayloadAction<StructureElement>);

        dispatch({
            type: actions.HANDLE_BACK_CLICK_SAGA
        } as PayloadAction);
    }, [dispatch]);

    const handleOnRatingChange = useCallback((
        value: string,
        elementId: number
    ) => {
        const newRating = Array(4).fill(0);
        newRating[parseInt(value) - 1] = 1;

        const elementIndex = displayElements.findIndex(item => item.data.expressID === elementId);
        if (elementIndex === -1) return;

        const newData = [...displayElements];
        newData[elementIndex] = {
            ...newData[elementIndex],
            ifcElementRatingValue: value,
            condition: newRating,
            isSaved: false
        };

        dispatch({
            payload: newData,
            type: actions.UPDATE_DISPLAY_LIST_ITEMS
        });
    }, [displayElements, dispatch]);

    const handleRowDoubleClick = useCallback((element: StructureElement) => {
        if (element.children?.length === 0) {
            dispatch({
                type: actions.SET_SELECTED_STRUCTURE_ELEMENT,
                payload: element
            } as PayloadAction<StructureElement>);

            goTo(RoutesValueEnum.IFCViewer);
        }
    }, [dispatch, goTo]);

    const handleSaveButton = useCallback((item: StructureElement) => {
        dispatch({ type: commonActions.SHOW_LOADING_OVERLAY });

        dispatch({
            type: actions.SAVE_CONDITION_RATING_DATA,
            payload: { ...item, isSaved: true } as StructureElement
        } as PayloadAction<StructureElement>);

        setTimeout(() => {
            dispatch({ type: commonActions.CLOSE_LOADING_OVERLAY });
        }, 120);
    }, [dispatch]);


    const handleChildPageChange = (event: unknown, newPage: number) => {
        setChildPage(newPage);
    };

    const handleChildRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChildRowsPerPage(parseInt(event.target.value, 10));
        setChildPage(0);
    };

    return (
        <React.Fragment>
            <Stack direction={'column'}>
                <Grid
                    container
                    sx={{
                        margin: isPortrait ? '10px 0' : '10px 5px'
                    }}
                    spacing={isPortrait ? 1 : 2}
                    direction={isPortrait ? 'column' : 'row'}
                >
                    <Grid size={isPortrait ? 12 : 4} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', maxWidth: isPortrait ? '100%' : '400px' }}>
                            <SearchBarComponent onSearchChange={setSearchQuery} searchQuery={searchQuery} />
                        </Box>
                    </Grid>
                    <Grid size={isPortrait ? 12 : 4}>
                        <Box sx={{ width: '100%', maxWidth: isPortrait ? '100%' : '400px', display: 'flex', alignItems: 'center', justifyContent: isTablet ? 'flex-end' : 'center' }}>
                            <CircularProgressWithLabel totalQuantity={totalIFCElementQuantity || 0} reviewedCount={ratedElements?.length || 0} label="progress" />
                        </Box>
                    </Grid>
                    <Grid size={isPortrait ? 12 : 4}>
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
                    ref={tableContainerRef}
                    component={Paper}
                    sx={{
                        mt: 2,
                        maxHeight: isTablet ? '60vh' : '70vh',
                        overflow: 'auto'
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow>
                                <StyledTableHeaderCell sx={{ display: isPortrait ? 'none' : 'table-cell' }}>AssetID</StyledTableHeaderCell>
                                <StyledTableHeaderCell>Name</StyledTableHeaderCell>
                                <StyledTableHeaderCell>Section</StyledTableHeaderCell>
                                <StyledTableHeaderCell sx={{ display: isPortrait ? 'none' : 'table-cell' }}>Quantity</StyledTableHeaderCell>
                                <StyledTableHeaderCell sx={{ textAlign: 'center', width: '250px' }}>
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
                                <StyledTableHeaderCell>Actions</StyledTableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedChildren?.map((element: StructureElement) => (
                                <TableRowComponent
                                    key={element.data?.expressID}
                                    element={element}
                                    selectedElement={selectedElement}
                                    isPortrait={isPortrait}
                                    handleRowClick={handleRowClick}
                                    handleRowDoubleClick={handleRowDoubleClick}
                                    handleOnRatingChange={handleOnRatingChange}
                                    handleSaveButton={handleSaveButton}
                                    addAssessmentOnClick={addAssessmentOnClick}
                                    maintenanceActionList={maintenanceActionList}
                                />
                            ))}
                        </TableBody>
                    </Table>
                    {hasManyChildren && (
                        <TablePagination
                            rowsPerPageOptions={[10, 20, 50]}
                            component="div"
                            count={filteredTreeData.length}
                            rowsPerPage={childRowsPerPage}
                            page={childPage}
                            onPageChange={handleChildPageChange}
                            onRowsPerPageChange={handleChildRowsPerPageChange}
                            size="small"
                        />
                    )}
                </TableContainer>
            </Stack>
            <RMADialog
                handleClose={handleClose}
                modalState={maintenanceActionModalFlag}
                rmaMode={RMAModeEnum.IFCElement}
            />
        </React.Fragment>
    );
};

export default React.memo(StructureElementGrid);