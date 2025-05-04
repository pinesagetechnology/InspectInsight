import React, { useEffect, useState } from 'react';
import MapContainer from '../../components/mapContainer';
import { Structure } from '../../entities/structure';
import { useSelector } from 'react-redux';
import { getStructures } from '../../store/Structure/selectors';
import { useDispatch } from 'react-redux';
import * as structureActions from "../../store/Structure/actions";
import * as inspectionActions from "../../store/Inspection/actions";
import * as stepActions from "../../store/FormSteps/actions";
import { PayloadAction } from '@reduxjs/toolkit';
import ListModeStructure from '../../components/listStructureComponent';
import { useNavigationManager } from '../../navigation';
import { RoutesValueEnum, StructureFilterCategory } from "../../enums";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import styles from "./style.module.scss";
import { getLocalStorageFlag } from '../../store/LocalStorage/selector';
import * as localDataActions from "../../store/LocalStorage/actions";

const HomePage: React.FC = () => {
  const { goTo } = useNavigationManager();
  const [modalOpen, setModalOpen] = React.useState(false);

  const dispatch = useDispatch();
  const [structureList, setStructureList] = useState<Structure[]>([]);

  const structures = useSelector(getStructures);
  const [isListView, setIsListView] = useState(false);
  const hasLocalData = useSelector(getLocalStorageFlag);


  useEffect(() => {
    if (hasLocalData) {
      setModalOpen(true);
    }
  }, [hasLocalData]);

  useEffect(() => {
    dispatch({
      type: structureActions.FETCH_STRUCTURES_DATA
    } as PayloadAction);

    dispatch({
      type: localDataActions.CHECK_LOCAL_STORAGE_EXIST
    } as PayloadAction);
  }, []);

  useEffect(() => {
    setStructureList(structures);

    dispatch({
      type: stepActions.SET_NEXT_HEADER_BUTTON,
      payload: true
    } as PayloadAction<boolean>)
  }, [structures])


  const onSelectStructureHandler = (structure: Structure) => {
    dispatch({
      payload: structure,
      type: structureActions.SET_SLECTED_STRUCTURE_DATA
    } as PayloadAction<Structure>)
  }

  const applyFilter = (filters: Record<string, string[]>) => {
    const isFilterEmpty = Object.values(filters).every(items => items.length === 0);

    if (isFilterEmpty) {
      setStructureList(structures);
      return;
    }

    const selectedFilters = Object.entries(filters).map(([category, items]) => ({
      category,
      selected: items,
    }));

    let filteredList: Structure[] = [...structures];

    selectedFilters.forEach(filter => {
      if (filter.selected && filter.selected.length > 0) {
        switch (filter.category) {
          case StructureFilterCategory.Equipment:
            filteredList = filteredList.filter(structure =>
              filter.selected.some(item => {
                if (item === 'No equipment required') {
                  return !structure.equipments || structure.equipments.length === 0;
                }
                return structure.equipments?.includes(item);
              })
            );
            break;
          case StructureFilterCategory.Precinct:
            filteredList = filteredList.filter(structure =>
              filter.selected.includes(structure.precinct || "")
            );
            break;
          case StructureFilterCategory.Urgency:
            filteredList = filteredList.filter(structure =>
              filter.selected.includes(structure.urgency)
            );
            break;

          default:
            break;
        }
      }
    });

    setStructureList(filteredList);
  };

  const setIsListViewHandler = (flag: boolean) => {
    setIsListView(flag);
  }

  const startInspectionHandler = () => {
    dispatch({
      type: inspectionActions.START_INSPECTION_PROCESS,
    } as PayloadAction)
    goTo(RoutesValueEnum.InspectionDetail)
  }


  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleDiscardData = () => {
    dispatch({
      type: localDataActions.REMOVE_FROM_LOCAL_STORAGE
    } as PayloadAction);

    setModalOpen(false);

    goTo(RoutesValueEnum.Home);
  };

  const handleLoadData = () => {
    dispatch({
      type: localDataActions.MAP_LOCAL_STORAGE_STATE
    } as PayloadAction);

    setModalOpen(false);

    goTo(RoutesValueEnum.InspectionReview);
  };

  return (
    <div className={styles.homeContainer}>
      <Dialog
        open={modalOpen}
        onClose={handleModalClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Session data found
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Previous session data was found. Would you like to continue from where you left off or start fresh?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDiscardData}>Discard data</Button>
          <Button onClick={handleLoadData} autoFocus>
            Load Data
          </Button>
        </DialogActions>
      </Dialog>
      {!isListView ? (
        <MapContainer
          structures={structureList}
          isListView={isListView}
          onSelectStructure={onSelectStructureHandler}
          applyFilter={applyFilter}
          setIsListView={setIsListViewHandler}
          onStartClickHandler={startInspectionHandler}
        />
      ) : (
        <ListModeStructure
          isListView={isListView}
          onSelectStructure={onSelectStructureHandler}
          setIsListView={setIsListViewHandler}
          structures={structures || []}
          onStartClickHandler={startInspectionHandler}
        />
      )}
    </div>
  );
};

export default HomePage;
