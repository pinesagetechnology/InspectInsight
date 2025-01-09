import { createAction } from "@reduxjs/toolkit";

export const resetStateAction = createAction("resetState");
export const clearErrorState = createAction("clearErrors");
export const RESET_STATE_SAGA_ACTION = "sagaAction/ResetState";
export const CLOSE_LOADING_OVERLAY = "sagaAction/CloseLoadingOverLay";
export const SHOW_LOADING_OVERLAY = "sagaAction/ShowLoadingOverLay";
