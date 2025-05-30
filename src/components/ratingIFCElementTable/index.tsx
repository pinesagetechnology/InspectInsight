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
    IconButton,
    Tooltip,
    Grid2 as Grid,
    useMediaQuery,
    Box,
    Typography,
    Badge
} from '@mui/material';
import { useSelector } from 'react-redux';
import { StructureElement } from '../../entities/structure';
import {
    getAutoTableElementFocus,
    getDisplayElementList,
    getOriginalConditionRating,
    getRatedElements,
    getSelectedStructureElement
} from '../../store/ConditionRating/selectors';
import { useDispatch } from 'react-redux';
import * as actions from "../../store/ConditionRating/actions";
import RMADialog from '../maintenanceActionsDialog/rmaDialog';
import PostAddIcon from '@mui/icons-material/PostAdd';
import SearchBarComponent from '../ifcTreeComponent.tsx/searchBar';
import { getElementHistory } from '../../store/ConditionRating/selectors';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { filterTree, findPathToNode } from '../../helper/ifcTreeManager';
import RatingComponent from '../../components/ratingComponent';
import * as maintenanceActions from "../../store/MaintenanceAction/actions";
import { MaintenanceActionModel } from '../../models/inspectionModel';
import { getMaintenanceActionModalFlag, getMaintenanceActions } from '../../store/MaintenanceAction/selectors';
import { RMAModeEnum, RoutesValueEnum } from '../../enums';
import { useNavigationManager } from '../../navigation';
import * as commonActions from "../../store/Common/actions";
import { getTotalIFCElementQuantity } from '../../store/Structure/selectors';
import { CircularProgressWithLabel } from '../circularProgressWithLableComponent';
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

const StyledTableHeaderCell = styled(StyledTableCell)(({ theme }) => ({
    backgroundColor: theme.palette.grey[100],
    fontWeight: 600,
    color: theme.palette.text.primary,
    whiteSpace: 'nowrap'
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
        <StyledTableCell sx={{ display: isPortrait ? 'none' : 'table-cell' }}>{element.data.expressID}</StyledTableCell>
        <StyledTableCell>{element.data.Entity}</StyledTableCell>
        <StyledTableCell>{element.data.Name}</StyledTableCell>
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

    // Local state
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [goBackLabel, setGoBackLabel] = useState<string>('');
    const [reviewedCount, setReviewedCount] = useState<number>(0);

    // Responsive breakpoints
    const isTablet = useMediaQuery('(max-width:962px)');
    const isPortrait = useMediaQuery('(orientation: portrait)');

    // Memoized filtered data
    const filteredTreeData = useMemo(() => 
        searchQuery ? filterTree(displayElements, searchQuery) : displayElements,
        [displayElements, searchQuery]
    );

    // Effects
    useEffect(() => {
        setReviewedCount(ratedElements.length);
    }, [ratedElements]);

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

                if (tableContainerRef.current && selectedElement?.data) {
                    const elementToScroll = tableContainerRef.current.querySelector(
                        `[data-express-id="${selectedElement.data.expressID}"]`
                    );
                    if (elementToScroll) {
                        elementToScroll.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                }
            } finally {
                dispatch({ type: commonActions.CLOSE_LOADING_OVERLAY });
                dispatch({ type: actions.SET_AUTO_TABLE_ELEMENT_FOCUS, payload: -1 });
            }
        };

        walkPath();
    }, [autoTableElementFocus, selectedElement?.data, originalStructureElements]);

    useEffect(() => {
        dispatch({
            type: actions.RESET_CONDITION_RATING_DISPLAY_TABLE
        } as PayloadAction);
    }, []);

    useEffect(() => {
        setGoBackLabel(elementHistory.length > 0 ? elementHistory[elementHistory.length - 1][0].data.Entity : '');
    }, [elementHistory]);

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
        }, 1000);
    }, [dispatch]);

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
                            <CircularProgressWithLabel totalQuantity={totalIFCElementQuantity || 0} reviewedCount={reviewedCount} label="progress" />
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
                                <StyledTableHeaderCell sx={{ display: isPortrait ? 'none' : 'table-cell' }}>ID</StyledTableHeaderCell>
                                <StyledTableHeaderCell>Entity</StyledTableHeaderCell>
                                <StyledTableHeaderCell>Name</StyledTableHeaderCell>
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
                            {filteredTreeData?.map((element: StructureElement) => (
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