import React from 'react';
import { useDispatch } from 'react-redux';
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Grid2 as Grid,
  useMediaQuery,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useNavigationManager } from '../../navigation';
import { useSelector } from 'react-redux';
import { getCurrentStep, getNextButtonFlag, getStepsState } from '../../store/FormSteps/selectors';
import * as actions from "../../store/FormSteps/actions";
import { PayloadAction } from '@reduxjs/toolkit';
import { Check as CheckIcon, NavigateBefore, NavigateNext } from '@mui/icons-material';
import { RoutesValueEnum } from "../../enums";
import * as localStorageActions from "../../store/LocalStorage/actions";
import styles from './style.module.scss';

const PageFooter: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { goTo, getCurrentPageName } = useNavigationManager();
  const stepList = useSelector(getStepsState);
  const currentStep = useSelector(getCurrentStep);
  const nextButtonFlag = useSelector(getNextButtonFlag);

  // Detect if we're on a small screen like a tablet
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  // Detect if we're on a very small screen like a phone
  const isXsScreen = useMediaQuery(theme.breakpoints.down('sm'));

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
      if (getCurrentPageName() === RoutesValueEnum.PreviousInspectionDetail) {
        goTo(RoutesValueEnum.PreviousInspection);
      } else {
        goTo(RoutesValueEnum.Home);
      }
    }
  };

  return (
    <Paper elevation={3} className={styles.footer}>
      <Grid container alignItems="center">
        {/* Back Button */}
        <Grid size={isXsScreen ? 2 : 1} className={styles.buttonContainer}>
          {isSmallScreen ? (
            <IconButton
              color="primary"
              onClick={handleBack}
              size="large"
              className={styles.navButton}
            >
              <NavigateBefore />
            </IconButton>
          ) : (
            <Button
              onClick={handleBack}
              variant="contained"
              color="secondary"
              className={styles.navButton}
            >
              Back
            </Button>
          )}
        </Grid>

        {/* Stepper */}
        <Grid size={isXsScreen ? 8 : 10} className={styles.stepperContainer}>
          <Stepper
            activeStep={currentStep}
            alternativeLabel={!isXsScreen}
            sx={{
              width: '100%',
              '& .MuiStepLabel-label': {
                fontSize: isSmallScreen ? '0.7rem' : '0.85rem',
              },
              '& .MuiStepIcon-root': {
                fontSize: isSmallScreen ? '1.2rem' : '1.5rem',
              }
            }}
          >
            {stepList.map((step) => (
              <Step key={step.index} completed={step.isCompleted}>
                <StepLabel
                  StepIconProps={{
                    icon: step.isCompleted ? <CheckIcon /> : step.index + 1,
                    sx: {
                      cursor: 'pointer',
                    }
                  }}
                  onClick={() => {
                    dispatch({
                      payload: step.index,
                      type: actions.SET_ACTIVE_STEP
                    } as PayloadAction<number>);
                    goTo(step.path);
                  }}
                >
                  {/* On very small screens, only show the step icon */}
                  {!isXsScreen && step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Grid>

        {/* Next Button */}
        <Grid size={isXsScreen ? 2 : 1} className={styles.buttonContainer}>
          {isSmallScreen ? (
            <Tooltip title={currentStep === stepList.length - 1 || !nextButtonFlag ? "Unavailable" : "Next"}>
              <span>
                <IconButton
                  color="primary"
                  onClick={handleNext}
                  disabled={currentStep === stepList.length - 1 || !nextButtonFlag}
                  size="large"
                  className={styles.navButton}
                >
                  <NavigateNext />
                </IconButton>
              </span>
            </Tooltip>
          ) : (
            <Button
              onClick={handleNext}
              disabled={currentStep === stepList.length - 1 || !nextButtonFlag}
              variant="contained"
              color="primary"
              className={styles.navButton}
            >
              Next
            </Button>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PageFooter;