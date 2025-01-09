import { RootState } from "../../store/rootReducers";

export const isOnlineSelector = (state: RootState) => state.SystemAvailabilitySlice.isOnline;

