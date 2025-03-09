import { RootState } from "../../store/rootReducers";

export const getStepsState = (state: RootState) => state.StepsState.steps;
export const getCurrentStep = (state: RootState) => state.StepsState.currentStep;
export const isAllStepsCompleted = (state: RootState) => {
    const clonedList = [...state.StepsState.steps];
    clonedList.pop();
    return clonedList.every(x => x.isCompleted === true);
}
export const getNextButtonFlag = (state: RootState) => state.StepsState.showNextButton;