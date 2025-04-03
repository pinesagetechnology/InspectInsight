import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InspectionModel } from '../../models/inspectionModel';
import { InspectionEntity } from '../../entities/inspection';
import { resetStateAction } from '../Common/actions';
import { StructureElement } from '../../entities/structure';

export interface InspectionState {
    currentInspection: InspectionModel;
    previoustInspection: InspectionEntity;
    previoustInspectionsList: InspectionEntity[];
    previousInspectionRatedElement: StructureElement[];
    isLoading: boolean;
    error: any;
    validationErrors: string[];
}

const initialState = {
    currentInspection: {
        temperature: 0,
        inspectionDate: new Date().toISOString(),
        nextInspectionProposedDate: new Date().toISOString()
    } as InspectionModel,
    isLoading: false,
    validationErrors: [] as string[]
} as InspectionState

const InspectionSlice = createSlice({
    name: "InspectionDataState",
    initialState: initialState,
    reducers: {
        setCurrentInspection: (state, action: PayloadAction<InspectionModel>) => {
            state.currentInspection = action.payload;
        },
        fetchPreviousInspectionData: (state) => {
            state.error = undefined;
        },
        fetchPreviousInspectionsListSuccessful: (state, action: PayloadAction<InspectionEntity[]>) => {
            state.previoustInspectionsList = action.payload;
        },
        setPreviousInspectionData: (state, action: PayloadAction<InspectionEntity>) => {
            state.previoustInspection = action.payload;
        },
        setInspectionDataFailure: (state, action: PayloadAction<any>) => {
            state.error = action.payload;
        },
        setInspectionProcessLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setPreviousRatedElements: (state, action: PayloadAction<StructureElement[]>) => {
            state.previousInspectionRatedElement = action.payload;
        },
        setInspectionFormValidationFlag: (state, action: PayloadAction<string[]>) => {
            state.validationErrors = action.payload;
        },
        setInspectionStateFromStorage: (state, action: PayloadAction<InspectionState>) => {
            state.currentInspection = action.payload.currentInspection;
            state.error = action.payload.error
            state.previoustInspection = action.payload.previoustInspection;
            state.isLoading = action.payload.isLoading;
            state.validationErrors = action.payload.validationErrors;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(resetStateAction, (state) => {
            state.currentInspection = {
                temperature: 0,
                inspectionDate: new Date().toISOString(),
                nextInspectionProposedDate: new Date().toISOString()
            } as InspectionModel;
            state.previoustInspection = {} as InspectionEntity;
            state.previousInspectionRatedElement = [];
            state.isLoading = false;
            state.validationErrors = [] as string[];
            state.error = '';
        });
    }
});

export const {
    setCurrentInspection,
    fetchPreviousInspectionData,
    fetchPreviousInspectionsListSuccessful,
    setPreviousInspectionData,
    setInspectionDataFailure,
    setInspectionProcessLoading,
    setInspectionStateFromStorage,
    setPreviousRatedElements,
    setInspectionFormValidationFlag
} = InspectionSlice.actions;

export default InspectionSlice.reducer;