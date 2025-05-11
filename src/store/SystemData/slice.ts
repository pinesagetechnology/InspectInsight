import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MMSActivity } from "../../entities/systemData";
import { MenuItemModel } from "../../models/menuItemModel";
import { ElementCodeData } from "entities/structure";

export interface SystemBaseDataState{
    MMSActivityList: MMSActivity[];
    MMSActivities: MenuItemModel[]
    ElementsCodeList: ElementCodeData[];
    ElementsCode: MenuItemModel[]
    error: any;
} 

const initialState: SystemBaseDataState = {
    MMSActivityList: [],
    MMSActivities: [],
    ElementsCodeList: [],
    ElementsCode: [],
    error: ''
}

const SystemDataSlice = createSlice({
    name: "SystemDataState",
    initialState: initialState,
    reducers: {
        setMMSActivityListData: (state, action: PayloadAction<MMSActivity[]>) => {
            state.MMSActivityList = action.payload;
            state.error = '';
        },
        setMMSActivities: (state, action: PayloadAction<MenuItemModel[]>) => {
            state.MMSActivities = action.payload;
        },
        setElementsCodeListData: (state, action: PayloadAction<ElementCodeData[]>) => {
            state.ElementsCodeList = action.payload;
            state.error = '';
        },
        setElementsCodes: (state, action: PayloadAction<MenuItemModel[]>) => {
            state.ElementsCode = action.payload;
        },
        setBaseDataError: (state, action: PayloadAction<any>) => {
            state.error = action.payload;
        }
    }
});

export const {
    setMMSActivities,
    setMMSActivityListData,
    setElementsCodeListData,
    setElementsCodes,
    setBaseDataError
} = SystemDataSlice.actions;

export default SystemDataSlice.reducer;