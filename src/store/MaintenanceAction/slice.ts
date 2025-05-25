import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MaintenanceActionModel } from '../../models/inspectionModel';
import { resetStateAction } from '../Common/actions';

export interface MaintenanceActionState {
    maintenanceFormData: MaintenanceActionModel;
    maintenanceActions: MaintenanceActionModel[];
    isUploading: boolean;
    error: any;
    validationErrors: string[];
    maintenanceActionModalFlag: boolean;
}

const initialState = {
    isUploading: false,
    maintenanceFormData: {} as MaintenanceActionModel,
    validationErrors: [],
    error: '',
    maintenanceActions: [],
    maintenanceActionModalFlag: false
} as MaintenanceActionState

const MaintenanceActionSlice = createSlice({
    name: "MaintenanceActionDataState",
    initialState: initialState,
    reducers: {
        setMaintenanceActionList: (state, action: PayloadAction<MaintenanceActionModel[]>) => {
            state.maintenanceActions = action.payload;
        },
        setCurrentMaintenanceFormData: (state, action: PayloadAction<MaintenanceActionModel>) => {
            state.maintenanceFormData = action.payload;
        },
        setUploadFlag: (state, action: PayloadAction<boolean>) => {
            state.isUploading = action.payload;
        },
        setMaintenanceAcctionError: (state, action: PayloadAction<any>) => {
            state.error = action.payload;
        },
        setMaintenanceValidationErrors: (state, action: PayloadAction<string[]>) => {
            state.validationErrors = action.payload;
        },
        setMaintenanceActionModalFlag: (state, action: PayloadAction<boolean>) => {
            state.maintenanceActionModalFlag = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(resetStateAction, (state) => {
            state.maintenanceActions = [] as MaintenanceActionModel[];
            state.maintenanceFormData = {} as MaintenanceActionModel;
            state.error = "";
            state.isUploading = false;
            state.validationErrors = [];
            state.maintenanceActionModalFlag = false;
        });
    },
});

export const {
    setUploadFlag,
    setCurrentMaintenanceFormData,
    setMaintenanceAcctionError,
    setMaintenanceActionList,
    setMaintenanceValidationErrors,
    setMaintenanceActionModalFlag
} = MaintenanceActionSlice.actions;

export default MaintenanceActionSlice.reducer;