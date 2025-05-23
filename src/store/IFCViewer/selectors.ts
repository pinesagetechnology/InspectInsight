import { RootState } from "../rootReducers";

export const getVisibilityOffIcons = (state: RootState) => state.IFCViewerState.visibilityIcons;

export const getFlattenStructureElement = (state: RootState) => state.IFCViewerState.flattenStructureElement;