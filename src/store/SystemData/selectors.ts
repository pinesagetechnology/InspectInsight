import { RootState } from "../rootReducers";

export const getMMSActivityData = (state: RootState) => state.SystemDataState.MMSActivityList;
export const getMMSActivities = (state: RootState) => state.SystemDataState.MMSActivities;


