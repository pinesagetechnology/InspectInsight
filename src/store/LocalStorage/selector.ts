import { RootState } from "../rootReducers";

export const getLocalStorageFlag = (state: RootState) => state.LocalStorageSlice.hasLocalStorage;
