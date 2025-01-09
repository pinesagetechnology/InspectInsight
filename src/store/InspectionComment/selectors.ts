import { RootState } from "../rootReducers";

export const getInspectionComment = (state: RootState) => state.InspectionCommentState.inspectionComment;
export const getAllInspectionCommentState = (state: RootState) => state.InspectionCommentState;
export const getInspectCommentFormValidation = (state: RootState) => state.InspectionCommentState.validationErrorsFlag;

