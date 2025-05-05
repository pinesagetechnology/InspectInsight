import { combineReducers } from "@reduxjs/toolkit";
import StepsState from "./FormSteps/slice";
import StructureState from "./Structure/slice";
import InspectionState from "./Inspection/slice";
import ConditionRatingState from "./ConditionRating/slice";
import MaintenanceActionState from "./MaintenanceAction/slice";
import InspectionCommentState from "./InspectionComment/slice";
import SystemAvailabilitySlice from "./SystemAvailability/slice";
import LoadingOverlayState from "./Common/slice";
import ReviewAndSubmitState from "./ReviewandSubmit/slice";
import IFCViewerState from "./IFCViewer/slice";
import LocalStorageSlice from "./LocalStorage/slice";
import AuthState from "./Auth/slice";
import SystemDataState from "./SystemData/slice";

const rootReducer = combineReducers({
    StepsState,
    InspectionState,
    StructureState,
    ConditionRatingState,
    MaintenanceActionState,
    InspectionCommentState,
    SystemAvailabilitySlice,
    LoadingOverlayState,
    ReviewAndSubmitState,
    LocalStorageSlice,
    IFCViewerState,
    AuthState,
    SystemDataState
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;