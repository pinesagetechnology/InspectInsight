import { RootState } from "store/rootReducers";

export const getShowOverlayFlag = (state: RootState) => state.LoadingOverlayState.showLoading;