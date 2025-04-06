import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StructureElement } from '../../entities/structure';
import { resetStateAction } from '../Common/actions';

export interface ConditionRatingState {
    originalConditionRating: StructureElement[];
    displayConditionRatingElements: StructureElement[];
    elementHistory: StructureElement[][];
    selectedStructureElement: StructureElement;
    ratedElements: StructureElement[];
    error?: any;
}

const initialState = {
    originalConditionRating: [],
    displayConditionRatingElements: [],
    elementHistory: [] as StructureElement[][],
    selectedStructureElement: {} as StructureElement,
    ratedElements: []
} as ConditionRatingState

const ConditionRatingSlice = createSlice({
    name: "ConditionRatingDataState",
    initialState: initialState,
    reducers: {
        setOriginalConditionRating: (state, action: PayloadAction<StructureElement[]>) => {
            state.originalConditionRating = action.payload;
        },
        setDisplayConditionRatingElements: (state, action: PayloadAction<StructureElement[]>) => {
            state.displayConditionRatingElements = action.payload;
        },
        setElementHistory: (state, action: PayloadAction<StructureElement[][]>) => {
            state.elementHistory = action.payload;
        },
        setSelectedStructureElement: (state, action: PayloadAction<StructureElement>) => {
            state.selectedStructureElement = action.payload;
        },
        setConditionRatingError: (state, action: PayloadAction<any>) => {
            state.error = action.payload;
        },
        setReatedElement: (state, action: PayloadAction<StructureElement[]>) => {
            state.ratedElements = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(resetStateAction, (state) => {
            state.originalConditionRating = [] as StructureElement[];
            state.elementHistory = [] as StructureElement[][];
        });
    }
});

export const {
    setOriginalConditionRating,
    setDisplayConditionRatingElements,
    setElementHistory,
    setSelectedStructureElement,
    setConditionRatingError,
    setReatedElement,
} = ConditionRatingSlice.actions;

export default ConditionRatingSlice.reducer;