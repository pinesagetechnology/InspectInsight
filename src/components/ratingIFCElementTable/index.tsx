import React, { useEffect, useState, useCallback, useRef } from 'react';
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
    Typography
} from '@mui/material';
import { useSelector } from 'react-redux';
import { StructureElement } from '../../entities/structure';
import { getAutoTableElementFocus, getDisplayElementList, getOriginalConditionRating, getSelectedStructureElement } from '../../store/ConditionRating/selectors';
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
import { getMaintenanceActionModalFlag } from '../../store/MaintenanceAction/selectors';
import { RMAModeEnum, RoutesValueEnum } from '../../enums';
import { useNavigationManager } from '../../navigation';
import * as commonActions from "../../store/Common/actions";

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
    const displayElements: StructureElement[] = useSelector(getDisplayElementList);
    const originalStructureElements = useSelector(getOriginalConditionRating);

    const elementHistory: StructureElement[][] = useSelector(getElementHistory);
    const maintenanceActionModalFlag = useSelector(getMaintenanceActionModalFlag);
    const selectedElement = useSelector(getSelectedStructureElement);
    const autoTableElementFocus = useSelector(getAutoTableElementFocus);
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const [searchQuery, setSearchQuery] = useState<string>('');
    const [goBackLabel, setGoBackLabel] = useState<string>('');

    // Responsive breakpoints
    const isTablet = useMediaQuery('(max-width:960px)');
    const isPortrait = useMediaQuery('(max-width:600px)');
    const hasExecutedRef = useRef<number | null>(null);

    const filteredTreeData = searchQuery ? filterTree(displayElements, searchQuery) : displayElements;

    const dispatch = useDispatch();

    useEffect(() => {
        if (autoTableElementFocus < 0 || !selectedElement?.data) return;

        // Prevent duplicate execution for the same autoTableElementFocus value
        if (hasExecutedRef.current === autoTableElementFocus) return;
        hasExecutedRef.current = autoTableElementFocus;

        setTimeout(() => {

            //show loading
            dispatch({
                type: commonActions.SHOW_LOADING_OVERLAY,
            });
            console.log('why???')
            const pathList = findPathToNode(originalStructureElements, selectedElement.data.Name || '');

            pathList.forEach(element => {
                setTimeout(() => {
                    if (element.children?.length > 0) {
                        handleRowClick(element);
                    } else {
                        console.log('found');
                        dispatch({ type: actions.SET_AUTO_TABLE_ELEMENT_FOCUS, payload: -1 } as PayloadAction<number>);
                        // After walking the path, scroll to the row
                        setTimeout(() => {
                            if (tableContainerRef.current && selectedElement?.data) {
                                const elementToScroll = tableContainerRef.current.querySelector(
                                    `[data-express-id="${selectedElement.data.expressID}"]`
                                );
                                if (elementToScroll) {
                                    elementToScroll.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                            }
                            // Hide loading after scroll
                            dispatch({
                                type: commonActions.CLOSE_LOADING_OVERLAY,
                            });
                        }, 200);
                    }
                }, 120);
            });
        }, 100); // 100ms delay, adjust as needed

        return () => {
            // dispatch({
            //     type: commonActions.CLOSE_LOADING_OVERLAY,
            // });
        };
    }, [autoTableElementFocus]);

    useEffect(() => {
        dispatch({
            type: actions.RESET_CONDITION_RATING_DISPLAY_TABLE
        } as PayloadAction)
    }, [])

    useEffect(() => {
        setGoBackLabel(elementHistory.length > 0 ? elementHistory[elementHistory.length - 1][0].data.Entity : '');
    }, [elementHistory])

    const handleRowClick = (element: StructureElement) => {
        if (element.children?.length > 0) {
            dispatch({
                payload: element,
                type: actions.HANDLE_ROW_CLICK_SAGA
            } as PayloadAction<StructureElement>);
        }
    }

    const handleClose = () => {
        dispatch({
            type: maintenanceActions.SET_MAINTENANCE_ACTION_MODAL_FLAG,
            payload: false
        } as PayloadAction<boolean>)
    }

    const addAssessmentOnClick = (element: StructureElement) => (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        dispatch({
            type: actions.SET_SELECTED_STRUCTURE_ELEMENT,
            payload: element
        } as PayloadAction<StructureElement>);

        const newMaintenanceAction = {
            id: "-1",
            isSectionExpanded: true,
            dateForCompletion: new Date().toISOString(),
            elementCode: element.data.Name || "",
            elementDescription: element.data.Entity,
            elementId: element.data.expressID.toString(),
            mode: 1
        } as MaintenanceActionModel;

        dispatch({
            type: maintenanceActions.ADD_NEW_ITEM,
            payload: newMaintenanceAction
        } as PayloadAction<MaintenanceActionModel>)
    }

    const handleBack = () => {
        dispatch({
            type: actions.SET_SELECTED_STRUCTURE_ELEMENT,
            payload: {} as StructureElement
        } as PayloadAction<StructureElement>);

        dispatch({
            type: actions.HANDLE_BACK_CLICK_SAGA
        } as PayloadAction);
    }

    const handleOnRatingChange = useCallback((
        value: string,
        elementId: number
    ) => {
        // Create rating array more efficiently
        const newRating = Array(4).fill(0);
        newRating[parseInt(value) - 1] = 1;

        // Use findIndex for better performance than map when we need to update a single item
        const elementIndex = displayElements.findIndex(item => item.data.expressID === elementId);

        if (elementIndex === -1) return;

        // Create new array with the updated item
        const newData = [...displayElements];
        newData[elementIndex] = {
            ...newData[elementIndex],
            ifcElementRatingValue: value,
            condition: newRating
        };

        // Batch dispatch actions
        dispatch({
            payload: newData,
            type: actions.UPDATE_DISPLAY_LIST_ITEMS
        });

        dispatch({
            type: actions.SET_SELECTED_STRUCTURE_ELEMENT,
            payload: newData[elementIndex]
        } as PayloadAction<StructureElement>);

        dispatch({
            type: actions.SAVE_CONDITION_RATING_DATA,
            payload: newData[elementIndex]
        } as PayloadAction<StructureElement>);

    }, [displayElements, dispatch]);


    const handleRowDoubleClick = (element: StructureElement) => {
        if (element.children?.length === 0) {
            dispatch({
                type: actions.SET_SELECTED_STRUCTURE_ELEMENT,
                payload: element
            } as PayloadAction<StructureElement>);

            goTo(RoutesValueEnum.IFCViewer);
        }
    }

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
                    ref={tableContainerRef}
                    component={Paper}
                    sx={{
                        mt: 2,
                        maxHeight: isTablet ? '60vh' : '70vh',
                        overflow: 'auto'
                    }}
                >
                    <Table stickyHeader aria-label="collapsible table">
                        <TableHead>
                            <TableRow>
                                <StyledTableHeaderCell sx={{ display: isPortrait ? 'none' : 'table-cell' }}>ID</StyledTableHeaderCell>
                                <StyledTableHeaderCell>Entity</StyledTableHeaderCell>
                                <StyledTableHeaderCell>Name</StyledTableHeaderCell>
                                <StyledTableHeaderCell sx={{ display: isPortrait ? 'none' : 'table-cell' }}>Quantity</StyledTableHeaderCell>
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
                            {filteredTreeData?.map((element: StructureElement) => (
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
                                        {element.children?.length > 0 &&
                                            (element.quantity)
                                        }
                                    </StyledTableCell>

                                    <StyledTableCell sx={{ width: '250px', textAlign: 'center' }}>
                                        {!element.children?.length && (
                                            <RatingComponent
                                                // isDisabled={false}
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
                                                    </Stack>
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
            <RMADialog
                handleClose={handleClose}
                modalState={maintenanceActionModalFlag}
                rmaMode={RMAModeEnum.IFCElement}
            />
        </React.Fragment>
    );
};

export default StructureElementGrid;