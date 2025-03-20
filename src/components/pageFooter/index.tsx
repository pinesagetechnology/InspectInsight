import React from 'react';
import { useDispatch } from 'react-redux';
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Grid2 as Grid,
} from '@mui/material';
import { useNavigationManager } from '../../navigation';
import { useSelector } from 'react-redux';
import { getCurrentStep, getNextButtonFlag, getStepsState } from '../../store/FormSteps/selectors';
import * as actions from "../../store/FormSteps/actions";
import { PayloadAction } from '@reduxjs/toolkit';
import { Check as CheckIcon } from '@mui/icons-material';
import styles from "./style.module.scss";
import { RoutesValueEnum } from "../../enums";
import * as localStorageActions from "../../store/LocalStorage/actions";

const PageFooter: React.FC = () => {
  const dispatch = useDispatch();
  const { goTo } = useNavigationManager();
  const stepList = useSelector(getStepsState);
  const currentStep = useSelector(getCurrentStep);
  const nextButtonFlag = useSelector(getNextButtonFlag);

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

  const handleBack = () => {
    if (!nextButtonFlag) {
      dispatch({
        type: actions.SET_NEXT_HEADER_BUTTON,
        payload: true
      } as PayloadAction<boolean>);
    }

    if (currentStep > 0) {
      dispatch({
        type: actions.SET_BACK_STEP,
        payload: currentStep
      });

      dispatch({
        type: localStorageActions.SAVE_IN_LOCAL_STORAGE,
      } as PayloadAction);

      goTo(stepList[currentStep - 1].path);
    } else {
      goTo(RoutesValueEnum.Home);
    }
  };

  return (
    <div className={styles.footer}>
      <Grid container>
        <Grid size={1} sx={{ textAlign: 'right' }}>
          <Button
            onClick={handleBack}
            variant="contained"
            color="secondary"
          >
            Back
          </Button>
        </Grid>
        <Grid size={10}>
          <Stepper activeStep={currentStep} alternativeLabel>
            {stepList.map((step, index) => (
              <Step key={step.index} completed={step.isCompleted}>
                <StepLabel
                  StepIconProps={{
                    icon: step.isCompleted ? <CheckIcon /> : step.index + 1,
                    sx: {
                      cursor: 'pointer',
                    }
                  }}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}

          </Stepper>
        </Grid>
        <Grid size={1}>
          <Button
            onClick={handleNext}
            disabled={currentStep === stepList.length - 1 || !nextButtonFlag}
            variant="contained"
            color="primary"
          >
            Next
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default PageFooter;
