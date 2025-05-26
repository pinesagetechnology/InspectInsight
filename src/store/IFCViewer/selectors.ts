import { RootState } from "../rootReducers";

export const getVisibilityOffIcons = (state: RootState) => state.IFCViewerState.visibilityIcons;

export const getGroupedElements = (state: RootState) => state.IFCViewerState.groupedElements;