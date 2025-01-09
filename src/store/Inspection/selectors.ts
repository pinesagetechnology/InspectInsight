import { RootState } from "../rootReducers";

export const getInspection = (state: RootState) => state.InspectionState.currentInspection;
export const getPreviousInspection = (state: RootState) => state.InspectionState.previoustInspection;
export const getAllInspectionState = (state: RootState) => state.InspectionState;
export const getPreviousInspectionRatedElement = (state: RootState) => state.InspectionState.previousInspectionRatedElement;
export const getFormValidationErrors = (state: RootState) => state.InspectionState.validationErrors;

