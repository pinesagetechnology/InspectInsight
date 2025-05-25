import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ElementCodeData, StructureElement } from '../../entities/structure';
import { resetStateAction } from '../Common/actions';

export interface ConditionRatingState {
    originalConditionRating: StructureElement[];
    displayConditionRatingElements: StructureElement[];
    elementHistory: StructureElement[][];
    selectedStructureElement: StructureElement;
    selectedElementCode: ElementCodeData;
    ratedElements: StructureElement[];
    ratedElementCodeData: ElementCodeData[];
    elementCodeDataList: ElementCodeData[];
    error?: any;
}

const initialState = {
    originalConditionRating: [],
    displayConditionRatingElements: [],
    elementHistory: [] as StructureElement[][],
    selectedStructureElement: {} as StructureElement,
    selectedElementCode: {} as ElementCodeData,
    ratedElements: [],
    ratedElementCodeData: [],
    elementCodeDataList: [],
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
        setSelectedElementCode: (state, action: PayloadAction<ElementCodeData>) => {
            state.selectedElementCode = action.payload;
        },
        setConditionRatingError: (state, action: PayloadAction<any>) => {
            state.error = action.payload;
        },
        setReatedElement: (state, action: PayloadAction<StructureElement[]>) => {
            state.ratedElements = action.payload;
        },
        setReatedElementCode: (state, action: PayloadAction<ElementCodeData[]>) => {
            state.ratedElementCodeData = action.payload;
        },
        setOriginalElementCodeDataList: (state, action: PayloadAction<ElementCodeData[]>) => {
            state.elementCodeDataList = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(resetStateAction, (state) => {
            state.originalConditionRating = [] as StructureElement[];
            state.elementHistory = [] as StructureElement[][];
            state.elementCodeDataList = [] as ElementCodeData[];
            state.ratedElementCodeData = [] as ElementCodeData[];
            state.ratedElements = [] as StructureElement[];
            state.selectedStructureElement = {} as StructureElement;
            state.selectedElementCode = {} as ElementCodeData;
            state.displayConditionRatingElements = [] as StructureElement[];
            state.error = '';
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
    setSelectedElementCode,
    setOriginalElementCodeDataList,
    setReatedElementCode
} = ConditionRatingSlice.actions;

export default ConditionRatingSlice.reducer;