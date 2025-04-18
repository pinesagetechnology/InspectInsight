import { RootState } from "../rootReducers";

export const isStructureLoading = (state: RootState) => state.StructureState.isLoading;
export const getCurrentStructure = (state: RootState) => state.StructureState.currentStructure;
export const getStructures = (state: RootState) => state.StructureState.structures;
export const getStructureElements = (state: RootState) => state.StructureState.currentStructure.elementMetadata;
