import { RootState } from "../rootReducers";

export const getInspectionComment = (state: RootState) => state.InspectionCommentState.inspectionComment;
export const getAllInspectionCommentState = (state: RootState) => state.InspectionCommentState;
export const getInspectCommentFormValidation = (state: RootState) => state.InspectionCommentState.validationErrorsFlag;

export const getAiSource = (state: RootState) => state.InspectionCommentState.aiSource;
export const getAiSourceStatus = (state: RootState) => state.InspectionCommentState.aiSourceStatus;