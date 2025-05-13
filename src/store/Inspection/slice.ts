import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InspectionModel } from '../../models/inspectionModel';
import { InspectionEntity } from '../../entities/inspection';
import { resetStateAction } from '../Common/actions';
import { ElementCodeData, StructureElement } from '../../entities/structure';

export interface InspectionState {
    currentInspection: InspectionModel;
    previoustInspection: InspectionEntity;
    previoustInspectionsList: InspectionEntity[];
    previousInspectionRatedElement: StructureElement[];
    previousInspectionIFCRatedElement: ElementCodeData[];
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
        setPreviousInspectionData: (state, action: PayloadAction<InspectionEntity>) => {
            state.previoustInspection = action.payload;
        },
        setPreviousInspectionListFromSavedState: (state, action: PayloadAction<InspectionEntity[]>) => {
            state.previoustInspectionsList = action.payload;
        },
        fetchPreviousInspectionsListSuccessful: (state, action: PayloadAction<InspectionEntity[]>) => {
            state.previoustInspectionsList = action.payload;
        },
        setInspectionDataFailure: (state, action: PayloadAction<any>) => {
            state.error = action.payload;
        },
        setInspectionProcessLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setPreviousInspectionRatedIFCElements: (state, action: PayloadAction<StructureElement[]>) => {
            state.previousInspectionRatedElement = action.payload;
        },
        setPreviousInspectionRatedElement: (state, action: PayloadAction<ElementCodeData[]>) => {
            state.previousInspectionIFCRatedElement = action.payload;
        },
        setInspectionFormValidationFlag: (state, action: PayloadAction<string[]>) => {
            state.validationErrors = action.payload;
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
            state.previoustInspectionsList = [] as InspectionEntity[];
            state.previousInspectionRatedElement = [];
            state.isLoading = false;
            state.validationErrors = [] as string[];
            state.error = '';
        });
    }
});

export const {
    setCurrentInspection,
    setPreviousInspectionListFromSavedState,
    fetchPreviousInspectionsListSuccessful,
    setPreviousInspectionData,
    setInspectionDataFailure,
    setInspectionProcessLoading,
    setInspectionFormValidationFlag,
    setPreviousInspectionRatedIFCElements,
    setPreviousInspectionRatedElement
} = InspectionSlice.actions;

export default InspectionSlice.reducer;