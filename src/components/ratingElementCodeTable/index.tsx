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
    Typography
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
import { validateConditionRating } from '../../helper/util';

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
        element: ElementCodeData,
        index: number
    ) => {
        const num = parseInt(event.target.value, 10);
        const currentCondition = element.condition ? [...element.condition] : [0, 0, 0, 0];

        const isValid = validateConditionRating(
            currentCondition,
            index,
            num,
            parseInt(element.totalQty, 10)
        );

        currentCondition[index] = isValid ? num : 0;

        const updatedData = structureElementsCode.map((item) =>
            item.elementCode === element.elementCode
                ? { ...item, condition: currentCondition }
                : item
        );

        dispatch({
            type: actions.UPDATE_ELEMENT_CODE_LIST,
            payload: updatedData
        });
    }

    const handleEditButton = (code: string) => {
        const element = structureElementsCode.find((item) => item.elementCode === code);
        setOriginalCondition(element?.condition || []);

        setEditRowId(editRowId === code ? null : code);
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

    const editOnClick = (elementCode: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        handleEditButton(elementCode)
    }

    const saveOnClick = (element: ElementCodeData) => (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        dispatch({
            type: actions.SAVE_ELEMENT_CODE_LIST,
        } as PayloadAction);

        setEditRowId(null);
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
                                <StyledTableHeaderCell>Unit</StyledTableHeaderCell>
                                <StyledTableHeaderCell>Rating</StyledTableHeaderCell>
                                <StyledTableHeaderCell>Action</StyledTableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredElementCodeData?.map((element: ElementCodeData) => (
                                <TableRow key={element.elementCode} style={{ cursor: 'pointer' }}>
                                    <StyledTableCell>{element.elementCode}</StyledTableCell>
                                    <StyledTableCell sx={{ display: isPortrait ? 'none' : 'table-cell' }}>{element.description}</StyledTableCell>
                                    <StyledTableCell>{(element.totalQty)}</StyledTableCell>
                                    <StyledTableCell>{element.unit}</StyledTableCell>

                                    <StyledTableCell className={styles.ratingConditionCell}>
                                        <Stack direction="row" spacing={isPortrait ? 0.5 : 1}>
                                            {[0, 1, 2, 3].map((_, index) => {
                                                const fieldValue = (element.condition && element.condition[index]) ? element.condition[index] : 0;
                                                const focusedKey = `${element.elementCode}-${index}`;
                                                return (
                                                    <Grid container key={`stack-${focusedKey}`} >
                                                        <Grid size={3} >
                                                            <p className={styles.conditionRatingHeader}>{`CS${index}`}</p>
                                                            {(editRowId === element.elementCode) ? (
                                                                <RatingInput
                                                                    key={focusedKey}
                                                                    variant="outlined"
                                                                    value={fieldValue}
                                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                        handleConditionChange(e, element, index)
                                                                    }}
                                                                    slotProps={{
                                                                        input: {
                                                                            type: 'number',
                                                                            inputProps: { min: 0 },
                                                                        }
                                                                    }}
                                                                />)
                                                                :
                                                                (<Item key={focusedKey}>{fieldValue}</Item>)
                                                            }
                                                        </Grid>

                                                    </Grid>
                                                )
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