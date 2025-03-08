import React, { useEffect, useState } from 'react';
import { Container } from '@mui/material';
import MapContainer from '../../components/mapContainer';
import { Structure } from '../../entities/structure';
import { useSelector } from 'react-redux';
import { getStructures } from '../../store/Structure/selectors';
import { useDispatch } from 'react-redux';
import * as structureActions from "../../store/Structure/actions";
import * as inspectionActions from "../../store/Inspection/actions";
import { PayloadAction } from '@reduxjs/toolkit';
import { FilterModel } from '../../models/map';
import { addDays } from '../../helper/util';
import ListModeStructure from '../../components/listStructureComponent';
import { useNavigationManager } from '../../navigation';
import { RoutesValueEnum } from "../../enums";
import styles from "./style.module.scss";

const HomePage = () => {
  const { goTo } = useNavigationManager();

  const dispatch = useDispatch();
  const [structureList, setStructureList] = useState<Structure[]>([]);
  const structures = useSelector(getStructures);
  const [isListView, setIsListView] = useState(false);

  useEffect(() => {
    setStructureList(structures);
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
  return (
    <div className={styles.homeContainer}>
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
