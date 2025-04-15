import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../rootReducers";

export const getMaintenanceActions = (state: RootState) => state.MaintenanceActionState.maintenanceActions;
export const getMaintenanceFormData = (state: RootState) => state.MaintenanceActionState.maintenanceFormData;
export const getIsUploadingFlag = (state: RootState) => state.MaintenanceActionState.isUploading;

export const getElementMaintenanceAction = (eleCode: string) =>
    createSelector(getMaintenanceActions, (data) => {
        return data.filter(item => item.elementCode === eleCode)
    });

export const getAllMaintenanceActionState = (state: RootState) => state.MaintenanceActionState;
