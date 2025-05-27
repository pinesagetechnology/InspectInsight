import React, { useEffect, useState } from 'react';
import MapContainer from '../../components/mapContainer';
import { Structure } from '../../entities/structure';
import { useSelector } from 'react-redux';
import {
  getStructureDisplayMode,
  getStructures
} from '../../store/Structure/selectors';
import { useDispatch } from 'react-redux';
import * as structureActions from "../../store/Structure/actions";
import * as inspectionActions from "../../store/Inspection/actions";
import * as stepActions from "../../store/FormSteps/actions";
import * as systemDataActions from "../../store/SystemData/actions";
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
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import styles from "./style.module.scss";
import { getLocalStorageFlag } from '../../store/LocalStorage/selector';
import * as localDataActions from "../../store/LocalStorage/actions";
import IFCDownloadDialog from '../../components/ifcDownloadDialog';
import { hasIFCFile } from '../../helper/db';

const HomePage: React.FC = () => {
  const { goTo } = useNavigationManager();
  const [modalOpen, setModalOpen] = React.useState(false);

  const dispatch = useDispatch();
  const structures = useSelector(getStructures);
  const [structureList, setStructureList] = useState<Structure[]>([]);
  const [showIFCDownloadDialog, setShowIFCDownloadDialog] = useState(false);
  const [selectedForDownload, setSelectedForDownload] = useState<Structure | null>(null);

  const structureDataMode = useSelector(getStructureDisplayMode);

  const [isListView, setIsListView] = useState(false);
  const hasLocalData = useSelector(getLocalStorageFlag);
  const [openSnackBar, setOpenSnackBar] = useState(false);

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
      type: systemDataActions.GET_SYSTEM_DATA
    } as PayloadAction);

    dispatch({
      type: systemDataActions.GET_ELEMENTS_CODE_DATA
    } as PayloadAction);

    dispatch({
      type: localDataActions.CHECK_LOCAL_STORAGE_EXIST
    } as PayloadAction);
  }, []);

  useEffect(() => {
    setStructureList(
      (structureDataMode === 'ifc') ?
        structures?.filter(item => item.elementMetadata?.length > 0)
        :
        structures?.filter(item => item.elementsCodeData?.length > 0));

    dispatch({
      type: stepActions.SET_NEXT_HEADER_BUTTON,
      payload: true
    } as PayloadAction<boolean>)
  }, [structureDataMode, structures])


  const onSelectStructureHandler = (structure: Structure) => {
    dispatch({
      payload: structure,
      type: structureActions.SET_SLECTED_STRUCTURE_DATA
    } as PayloadAction<Structure>);

    checkAndPromptIFCDownload(structure);
  }

  const applyFilter = (filters: Record<string, string[]>) => {
    const isFilterEmpty = Object.values(filters).every(items => items.length === 0);

    if (isFilterEmpty) {
      setStructureList(
        (structureDataMode === 'ifc') ?
          structures?.filter(item => item.elementMetadata?.length > 0)
          :
          structures?.filter(item => item.elementsCodeData?.length > 0));
      return;
    }

    const selectedFilters = Object.entries(filters).map(([category, items]) => ({
      category,
      selected: items,
    }));

    let filteredList: Structure[] = [...((structureDataMode === 'ifc') ? structures?.filter(item => item.elementMetadata?.length > 0) : structures?.filter(item => item.elementsCodeData?.length > 0))];

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

    dispatch({
      type: stepActions.SET_NEXT_STEP,
      payload: -1
    } as PayloadAction<number>);

    setModalOpen(false);

    goTo(RoutesValueEnum.InspectionDetail);
  };

  const checkAndPromptIFCDownload = async (structure: Structure) => {
    if (structure.ifcfileaddress && navigator.onLine) {
      const hasLocalFile = await hasIFCFile(structure.id);
      if (!hasLocalFile) {
        setSelectedForDownload(structure);
        setShowIFCDownloadDialog(true);
      }
    }
  };

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') return;
    setOpenSnackBar(false);
  };


  const handleDisplayModeChange = (value: string) => {
    dispatch({
      type: structureActions.SET_STRUCTURE_DISPLAY_MODE,
      payload: value
    } as PayloadAction<string>);
  }

  return (
    <div className={styles.homeContainer}>
      {(selectedForDownload && structureDataMode === 'ifc') && (
        <IFCDownloadDialog
          open={showIFCDownloadDialog}
          structureName={selectedForDownload.name}
          structureId={selectedForDownload.id}
          ifcPath={selectedForDownload.ifcfileaddress || ''}
          onClose={() => {
            setShowIFCDownloadDialog(false);
            setSelectedForDownload(null);
          }}
          onDownloadComplete={() => {
            // Update local storage to indicate the file is downloaded
            localStorage.setItem(`ifc_downloaded_${selectedForDownload.id}`, 'true');
            setOpenSnackBar(true);
          }}
        />
      )}
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
          handleDisplayModeChange={handleDisplayModeChange}
          structureMode={structureDataMode}
        />
      ) : (
        <ListModeStructure
          isListView={isListView}
          onSelectStructure={onSelectStructureHandler}
          setIsListView={setIsListViewHandler}
          structures={structureList}
          onStartClickHandler={startInspectionHandler}
          applyFilter={applyFilter}
          handleDisplayModeChange={handleDisplayModeChange}
          structureMode={structureDataMode}
        />
      )}
      <Snackbar
        open={openSnackBar}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          Download successful!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default HomePage;
