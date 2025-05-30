import { RootState } from "../rootReducers";
import { createSelector } from "@reduxjs/toolkit";

export const isStructureLoading = (state: RootState) => state.StructureState.isLoading;
export const getCurrentStructure = (state: RootState) => state.StructureState.currentStructure;
export const getStructures = (state: RootState) => state.StructureState.structures;
export const getStructureElements = (state: RootState) => state.StructureState.currentStructure.elementMetadata;
export const getStructureIFCPath = (state: RootState) => state.StructureState.currentStructure.ifcfileaddress;
export const getElementsCodeData = (state: RootState) => state.StructureState.currentStructure.elementsCodeData;
export const getIFCCalculatedElementCodeData = (state: RootState) => state.StructureState.currentStructure.ifcCalculatedElementCodeData;
export const getTotalIFCElementQuantity = (state: RootState) => state.StructureState.currentStructure.totalIFCElementQuantity;
export const getTotalElementCodeQuantity = (state: RootState) => state.StructureState.currentStructure.totalElementCodeQuantity;

export const getStructureDisplayMode = (state: RootState) => state.StructureState.displayMode;
