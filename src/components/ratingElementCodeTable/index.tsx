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
    Box
} from '@mui/material';
import { useSelector } from 'react-redux';
import { ElementCodeData } from '../../entities/structure';
import styles from './style.module.scss';
import { useDispatch } from 'react-redux';
import * as actions from "../../store/ConditionRating/actions";
import RMADialog from './maintenanceActions/rmaDialog';
import PostAddIcon from '@mui/icons-material/PostAdd';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import SearchBarComponent from '../ifcTreeComponent.tsx/searchBar';
import { getElementCodeDataList } from '../../store/ConditionRating/selectors';

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

const RatingInput = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        width: '50px',
        height: '35px',
        '& input': {
            padding: '4px',
            textAlign: 'center',
        }
    },
    '@media (max-width: 600px)': {
        '& .MuiOutlinedInput-root': {
            width: '40px',
            height: '30px',
        }
    }
}));

const ElementsCodeGrid: React.FC = () => {
    const structureElementsCode = useSelector(getElementCodeDataList);
    const [open, setOpen] = useState<boolean>(false);

    const [editRowId, setEditRowId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filteredElementCodeData, setFilteredElementCodeData] = useState<ElementCodeData[]>(structureElementsCode);
    const [originalCondition, setOriginalCondition] = useState<number[]>([]);

    // Responsive breakpoints
    const isTablet = useMediaQuery('(max-width:960px)');
    const isPortrait = useMediaQuery('(max-width:600px)');
 
    useEffect(() => {
        if (searchQuery) {
            const filterd = structureElementsCode.map(item => {
                const isMatch = item.elementCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.description.toLocaleLowerCase().includes(searchQuery.toLowerCase());
                if (isMatch) {
                    return item;
                }
                return null;
            }).filter(element => element !== null) as ElementCodeData[];
            setFilteredElementCodeData(filterd);

        } else {
            setFilteredElementCodeData(structureElementsCode);
        }
    }, [searchQuery, structureElementsCode])

    const dispatch = useDispatch();

    const handleConditionChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        elementCode: string,
        index: number
    ) => {
        const onlyNums = event.target.value.replace(/[^0-9]/g, '');
        if (onlyNums) {
            const num = parseInt(onlyNums, 10);
            if (num >= 1 && num <= 4) {
                const newData = structureElementsCode.map((item) => {
                    if (item.elementCode === elementCode) {
                        const newConditions: number[] = [0, 0, 0, 0];
                        [0, 1, 2, 3].forEach(x => {
                            if (index === x) {
                                newConditions[x] = num;
                            } else if (item.condition && item.condition![x]) {
                                newConditions[x] = item.condition![x];
                            } else {
                                newConditions[x] = 0;
                            }
                        });
                        return { ...item, condition: newConditions };
                    }
                    return item;
                });

                dispatch({
                    payload: newData,
                    type: actions.UPDATE_ELEMENT_CODE_LIST
                });
            }
        }
    }

    const handleEditButton = (id: string) => {
        setEditRowId(editRowId === id ? null : id);
    }

    const handleRowClick = (element: ElementCodeData) => {
        setOriginalCondition(element.condition || []);
        console.log("Row clicked", element);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const addAssessmentOnClick = (element: ElementCodeData) => (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        dispatch({
            type: actions.SET_SELECTED_ELEMENT_CODE,
            payload: element
        } as PayloadAction<ElementCodeData>);

        setOpen(true);
    }

    const cancelOnClick = (elementId: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        setEditRowId(null);

        const updatedElement = structureElementsCode.map((item) => {
            if (elementId === item.elementCode) {
                return { ...item, condition: [...originalCondition] };
            }
            return item;
        })

        dispatch({
            payload: updatedElement,
            type: actions.UPDATE_ELEMENT_CODE_LIST
        });
    }

    const editOnClick = (elementId: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        handleEditButton(elementId)
    }

    const saveOnClick = (element: ElementCodeData) => (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        dispatch({
            type: actions.SAVE_ELEMENT_CODE_LIST,
            payload: structureElementsCode
        } as PayloadAction<ElementCodeData[]>);

        setEditRowId(null);
    }

    const onRatingCellDoubleClock = (elementId: string) => () => {
        if (!(!!editRowId && elementId !== editRowId)) {
            handleEditButton(elementId)
        }
    }

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
                                <StyledTableHeaderCell>Rating</StyledTableHeaderCell>
                                <StyledTableHeaderCell>Unit</StyledTableHeaderCell>
                                <StyledTableHeaderCell>Action</StyledTableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredElementCodeData?.map((element: ElementCodeData) => (
                                <TableRow key={element.elementCode} onClick={() => handleRowClick(element)} style={{ cursor: 'pointer' }}>
                                    <StyledTableCell>{element.elementCode}</StyledTableCell>
                                    <StyledTableCell sx={{ display: isPortrait ? 'none' : 'table-cell' }}>{element.description}</StyledTableCell>
                                    <StyledTableCell>{(element.totalQty)}</StyledTableCell>
                                    <StyledTableCell>{element.unit}</StyledTableCell>

                                    <StyledTableCell
                                        className={styles.radingConditionCell}
                                        onDoubleClick={onRatingCellDoubleClock(element.elementCode || "")}
                                    >
                                        <Stack direction="row" spacing={isPortrait ? 0.5 : 1}>
                                            {[0, 1, 2, 3].map((_, index) => {
                                                const fieldValue = (element.condition && element.condition[index]) ? element.condition[index] : 0;
                                                const focusedKey = `${element.elementCode}-${index}`;
                                                return (editRowId === element.elementCode) ? (
                                                    <RatingInput
                                                        key={focusedKey}
                                                        variant="outlined"
                                                        value={fieldValue}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                            const newValue = parseInt(e.target.value) || 0;
                                                            if (newValue >= 0 && newValue <= 4) {
                                                                handleConditionChange(e, element.elementCode, index)
                                                            }
                                                        }}
                                                        slotProps={{
                                                            input: {
                                                                type: 'number'
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <Item key={focusedKey}>{fieldValue}</Item>
                                                );
                                            })}
                                        </Stack>
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Stack direction={isPortrait ? 'column' : 'row'} spacing={1}>
                                            <React.Fragment>
                                                {(editRowId === element.elementCode) ?
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
                                                                    onClick={cancelOnClick(element.elementCode)}
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
                                                            disabled={(!!editRowId && element.elementCode !== editRowId)}
                                                            onClick={editOnClick(element.elementCode)}
                                                            size={isPortrait ? 'small' : 'medium'}
                                                        >
                                                            {isPortrait ? 'Rate' : 'Add rating'}
                                                        </Button>
                                                    )
                                                }
                                            </React.Fragment>
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

export default ElementsCodeGrid;