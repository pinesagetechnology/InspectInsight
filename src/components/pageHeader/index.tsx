import { PayloadAction } from '@reduxjs/toolkit';
import React from 'react';
import { IconButton, Typography, Box } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { useNavigationManager } from '../../navigation';
import styles from "./style.module.scss";
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentStructure } from '../../store/Structure/selectors';
import { getCurrentStep, getStepsState } from '../../store/FormSteps/selectors';
import * as actions from "../../store/FormSteps/actions";
import * as localStorageActions from "../../store/LocalStorage/actions";
import { RoutesValueEnum } from "../../enums";

const PageHeader: React.FC = () => {
  const dispatch = useDispatch();
  const { goTo } = useNavigationManager();
  const stepList = useSelector(getStepsState);
  const currentStep = useSelector(getCurrentStep);
  const selectedStructure = useSelector(getCurrentStructure);
console.log("selectedStructure", currentStep);

  const handleNext = () => {
    if (currentStep < stepList.length - 1) {
      dispatch({
        type: actions.SET_NEXT_STEP,
        payload: currentStep
      } as PayloadAction<number>);

      dispatch({
        type: localStorageActions.SAVE_IN_LOCAL_STORAGE,
      } as PayloadAction);

      goTo(stepList[currentStep + 1].path);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      dispatch({
        type: actions.SET_BACK_STEP,
        payload: currentStep
      } as PayloadAction<number>);

      dispatch({
        type: localStorageActions.SAVE_IN_LOCAL_STORAGE,
      } as PayloadAction);

      goTo(stepList[currentStep - 1].path);
    }
    else {
      goTo(RoutesValueEnum.Home);
    }

  };

  return (
    <Box
      className={styles.pageHeaderContainer}
    >
      <IconButton onClick={handlePrev} color="primary">
        <ArrowBack fontSize="large" />
      </IconButton>

      <Typography variant="h5" component="h1" className={styles.headerTitle} >
        {(selectedStructure) ? selectedStructure.name : "Structure Title"}
      </Typography>

      <IconButton onClick={handleNext} color="primary">
        <ArrowForward fontSize="large" />
      </IconButton>

    </Box>
  );
};

export default PageHeader;
