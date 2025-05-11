import { RootState } from "../rootReducers";

export const getOriginalConditionRating = (state: RootState) => state.ConditionRatingState.originalConditionRating;
export const getDisplayElementList = (state: RootState) => state.ConditionRatingState.displayConditionRatingElements;
export const getElementHistory = (state: RootState) => state.ConditionRatingState.elementHistory;
export const getSelectedStructureElement = (state: RootState) => state.ConditionRatingState.selectedStructureElement;
export const getRatedElements = (state: RootState) => state.ConditionRatingState.ratedElements;
export const getAllConditionRatingState = (state: RootState) => state.ConditionRatingState;

export const getRatedElementCodeData = (state: RootState) => state.ConditionRatingState.ratedElementCodeData;
export const getSelectedElementCode = (state: RootState) => state.ConditionRatingState.selectedElementCode;
export const getElementCodeDataList = (state: RootState) => state.ConditionRatingState.elementCodeDataList;
