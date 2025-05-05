import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MMSActivity } from "../../entities/systemData";
import { MenuItemModel } from "../../models/menuItemModel";

export interface SystemBaseDataState{
    MMSActivityList: MMSActivity[];
    MMSActivities: MenuItemModel[]
    error: any;
} 

const initialState: SystemBaseDataState = {
    MMSActivityList: [],
    MMSActivities: [],
    error: ''
}

const SystemDataSlice = createSlice({
    name: "SystemDataState",
    initialState: initialState,
    reducers: {
        setMMSActivityData: (state, action: PayloadAction<MMSActivity[]>) => {
            state.MMSActivityList = action.payload;
            state.error = '';
        },
        setMMSActivities: (state, action: PayloadAction<MenuItemModel[]>) => {
            state.MMSActivities = action.payload;
        },
        setMMSActivityDataError: (state, action: PayloadAction<any>) => {
            state.error = action.payload;
        }
    }
});

export const {
    setMMSActivities,
    setMMSActivityData,
    setMMSActivityDataError
} = SystemDataSlice.actions;

export default SystemDataSlice.reducer;