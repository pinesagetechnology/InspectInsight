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
import { FilterModel } from '../../models/map';
import { addDays } from '../../helper/util';
import ListModeStructure from '../../components/listStructureComponent';
import { useNavigationManager } from '../../navigation';
import { RoutesValueEnum } from "../../enums";
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

  const filterLocationsHandler = (filter: FilterModel) => {
    const now = new Date();
    let filteredList: Structure[] = [...structureList || []];

    switch (filter.dueDateOption) {
      case 1:
        filteredList = structureList.filter(structure => {
          const lastInspectionDate = new Date(structure.lastInspectionDate);
          return lastInspectionDate < now;
        });
        break;
      case 2:
        const nextWeek = addDays(now, 7);
        filteredList = structureList.filter(structure => {
          const lastInspectionDate = new Date(structure.lastInspectionDate);
          return lastInspectionDate > now && lastInspectionDate <= nextWeek;
        });
        break;
      case 3:
        const nextMonth = addDays(now, 30);
        filteredList = structureList.filter(structure => {
          const lastInspectionDate = new Date(structure.lastInspectionDate);
          return lastInspectionDate > now && lastInspectionDate <= nextMonth;
        });
        break;
      default:
        setStructureList(structures);
        return;
    }

    setStructureList(filteredList);
  }

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
          onFilterLocations={filterLocationsHandler}
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
