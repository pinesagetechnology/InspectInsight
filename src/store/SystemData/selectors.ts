import { RootState } from "../rootReducers";

export const getMMSActivityData = (state: RootState) => state.SystemDataState.MMSActivityList;
export const getMMSActivities = (state: RootState) => state.SystemDataState.MMSActivities;
export const getElementsCodeListData = (state: RootState) => state.SystemDataState.ElementsCodeList;
export const getElementsCodes = (state: RootState) => state.SystemDataState.ElementsCode;


