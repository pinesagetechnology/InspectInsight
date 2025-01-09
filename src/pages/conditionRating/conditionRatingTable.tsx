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

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
  width: '60px'
}));

const StructureElementGrid: React.FC = () => {
  const displayElements = useSelector(getDisplayElementList);
  const [open, setOpen] = useState<boolean>(false);

  const [originalCondition, setOriginalCondition] = useState<number[]>([]);
  const [editRowId, setEditRowId] = useState<string | null>(null);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({
      type: actions.RESET_CONDITION_RATING_DISPLAY_TABLE
    } as PayloadAction)
  }, [])

  const handleConditionChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    elementId: string,
    index: number
  ) => {
    const onlyNums = event.target.value.replace(/[^0-9]/g, '');
    if (onlyNums) {
      const num = parseInt(onlyNums, 10);
      if (num >= 1 && num <= 4) { // Ensure the number is between 1 and 4
        const newData = displayElements.map((item) => {
          if (item.elementId === elementId) {
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
      // Handle the case where the input is cleared or invalid
      const newData = displayElements.map((item) => {
        if (item.elementId === elementId) {
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
  };

  const handleSaveButton = (item: StructureElement) => {
    dispatch({
      type: actions.SAVE_CONDITION_RATING_DATA,
      payload: item
    } as PayloadAction<StructureElement>)

    setEditRowId(null);
  }

  const handleEditButton = (id: string) => {
    setEditRowId(editRowId === id ? null : id);
    const selectedElement = displayElements.find(el => el.elementId === id);

    setOriginalCondition(selectedElement?.condition || []);
  }

  const handleCancelButton = (id: string) => {
    setEditRowId(null);
    const newData = displayElements.map((item) => {
      if (item.elementId === id) {
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

  };


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
    e.stopPropagation(); // Prevent row click event
    handleAddAssesmentOnClick(element);
  }

  const cancelOnClick = (elementId: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent row click event
    handleCancelButton(elementId);
  }

  const editOnClick = (elementId: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent row click event
    handleEditButton(elementId)
  }

  const saveOnClick = (element: StructureElement) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent row click event
    handleSaveButton(element);
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
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayElements?.map(element => (
              <TableRow key={element.elementId} onClick={() => handleRowClick(element)} style={{ cursor: 'pointer' }}>
                <TableCell>{element.description}</TableCell>
                <TableCell>{element.code}</TableCell>
                <TableCell>{element.quantity}</TableCell>
                <TableCell>{element.unit}</TableCell>
                <TableCell className={styles.radingConditionCell} onDoubleClick={onRatingCellDoubleClock(element.elementId)}>
                  {!element.children?.length && (
                    <Stack direction="row" spacing={1}>
                      {[0, 1, 2, 3].map((_, index) => {
                        const fieldValue = (element.condition && element.condition[index]) ? element.condition[index] : 0;
                        const focusedKey = `${element.elementId}-${index}`;
                        return (editRowId === element.elementId) ? (
                          <TextField
                            key={focusedKey}
                            size="small"
                            variant="outlined"
                            margin="none"
                            value={fieldValue}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handleConditionChange(e, element.elementId, index)
                            }
                            className={styles.conditionTextBox}
                          />
                        ) : (
                          <Item key={focusedKey}>{fieldValue}</Item>
                        );
                      })}
                    </Stack>
                  )}
                </TableCell>
                <TableCell>
                  <Stack direction={'row'} spacing={2}>
                    {!element.children?.length && (
                      <React.Fragment>
                        {(editRowId === element.elementId) ?
                          (<React.Fragment>
                            <Tooltip title="Add assessmentg">
                              <IconButton
                                color="primary"
                                onClick={addAssessmentOnClick(element)}>
                                <PostAddIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Save condition rating">
                              <IconButton
                                color="success"
                                onClick={saveOnClick(element)}>
                                <SaveIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Cancel condition rating">
                              <IconButton
                                color="secondary"
                                onClick={cancelOnClick(element.elementId)}>
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>

                          </React.Fragment>)
                          :
                          (
                            <Button
                              variant="contained"
                              color="secondary"
                              startIcon={<TroubleshootIcon />}
                              disabled={(!!editRowId && element.elementId !== editRowId)}
                              onClick={editOnClick(element.elementId)}>
                              Add rating
                            </Button>
                          )
                        }
                      </React.Fragment>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </React.Fragment>
  );
};

export default StructureElementGrid;
