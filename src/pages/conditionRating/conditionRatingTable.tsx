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
  useTheme,
  Box
} from '@mui/material';
import { useSelector } from 'react-redux';
import { StructureElement } from '../../entities/structure';
import { getDisplayElementList } from '../../store/ConditionRating/selectors';
import styles from './style.module.scss';
import { useDispatch } from 'react-redux';
import * as actions from "../../store/ConditionRating/actions";
import RMADialog from './rmaDialog';
import PostAddIcon from '@mui/icons-material/PostAdd';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import SearchBarComponent from '../../components/ifcTreeComponent.tsx/searchBar';
import { getElementHistory } from '../../store/ConditionRating/selectors';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { filterTree } from '../../helper/ifcTreeManager';

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

const StructureElementGrid: React.FC = () => {
  const theme = useTheme();
  const displayElements = useSelector(getDisplayElementList);
  const elementHistory: StructureElement[][] = useSelector(getElementHistory);
  const [open, setOpen] = useState<boolean>(false);

  const [originalCondition, setOriginalCondition] = useState<number[]>([]);
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

  const handleConditionChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    elementId: number,
    index: number
  ) => {
    const onlyNums = event.target.value.replace(/[^0-9]/g, '');
    if (onlyNums) {
      const num = parseInt(onlyNums, 10);
      if (num >= 1 && num <= 4) {
        const newData = displayElements.map((item) => {
          if (item.data.expressID === elementId) {
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
          type: actions.UPDATE_DISPLAY_LIST_ITEMS
        });
      }
    } else {
      const newData = displayElements.map((item) => {
        if (item.data.expressID === elementId) {
          const newConditions = [...(item.condition || [])];
          newConditions[index] = 0;
          return { ...item, condition: newConditions };
        }
        return item;
      });
      dispatch({
        payload: newData,
        type: actions.UPDATE_DISPLAY_LIST_ITEMS
      });
    }
  }

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
    setOriginalCondition(selectedElement?.condition || []);
  }

  const handleCancelButton = (id: number) => {
    setEditRowId(null);
    const newData = displayElements.map((item) => {
      if (item.data.expressID === id) {
        return { ...item, condition: originalCondition };
      }
      return item;
    });
    dispatch({
      payload: newData,
      type: actions.UPDATE_DISPLAY_LIST_ITEMS
    } as PayloadAction<StructureElement[]>);
  }

  const handleRowClick = (element: StructureElement) => {
    dispatch({
      payload: element,
      type: actions.HANDLE_ROW_CLICK_SAGA
    } as PayloadAction<StructureElement>);
  }

  const handleAddAssesmentOnClick = (element: StructureElement) => {
    dispatch({
      type: actions.SET_SELECTED_STRUCTURE_ELEMENT,
      payload: element
    } as PayloadAction<StructureElement>);
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
  }

  const addAssessmentOnClick = (element: StructureElement) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    handleAddAssesmentOnClick(element);
  }

  const cancelOnClick = (elementId: number) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    handleCancelButton(elementId);
  }

  const editOnClick = (elementId: number) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    handleEditButton(elementId)
  }

  const saveOnClick = (element: StructureElement) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    handleSaveButton(element);
  }

  const onRatingCellDoubleClock = (elementId: number) => () => {
    if (!(!!editRowId && elementId !== editRowId)) {
      handleEditButton(elementId)
    }
  }

  const handleBack = () => {
    dispatch({
      type: actions.HANDLE_BACK_CLICK_SAGA
    } as PayloadAction);
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
                <StyledTableHeaderCell>Rating</StyledTableHeaderCell>
                <StyledTableHeaderCell>Action</StyledTableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTreeData?.map((element: StructureElement) => (
                <TableRow key={element.data.expressID} onClick={() => handleRowClick(element)} style={{ cursor: 'pointer' }}>
                  <StyledTableCell sx={{ display: isPortrait ? 'none' : 'table-cell' }}>{element.data.expressID}</StyledTableCell>
                  <StyledTableCell>{element.data.Entity}</StyledTableCell>
                  <StyledTableCell>{element.data.Name}</StyledTableCell>
                  <StyledTableCell sx={{ display: isPortrait ? 'none' : 'table-cell' }}>{(element.quantity)}</StyledTableCell>
                  <StyledTableCell
                    className={styles.radingConditionCell}
                    onDoubleClick={onRatingCellDoubleClock(element.data.expressID || 0)}
                  >
                    {!element.children?.length && (
                      <Stack direction="row" spacing={isPortrait ? 0.5 : 1}>
                        {[0, 1, 2, 3].map((_, index) => {
                          const fieldValue = (element.condition && element.condition[index]) ? element.condition[index] : 0;
                          const focusedKey = `${element.data.expressID}-${index}`;
                          return (editRowId === element.data.expressID) ? (
                            <RatingInput
                              key={focusedKey}
                              variant="outlined"
                              value={fieldValue}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const newValue = parseInt(e.target.value) || 0;
                                if (newValue >= 0 && newValue <= 4) {
                                  handleConditionChange(e, element.data.expressID, index)
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