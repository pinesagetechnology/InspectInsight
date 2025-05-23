import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { resetStateAction } from '../Common/actions';
import { StructureElement } from '../../entities/structure';

export interface IFCViewerState {
    visibilityIcons: string[];
    flattenStructureElement: StructureElement[];
    error?: any;
}

const initialState = {
    visibilityIcons: [],
    flattenStructureElement: [] as StructureElement[]
} as IFCViewerState

const IFCViewerSlice = createSlice({
    name: "IFCViewerState",
    initialState: initialState,
    reducers: {
        setVisibilityIconOffValue: (state, action: PayloadAction<string[]>) => {
            state.visibilityIcons = action.payload;
        },
        setFlattenStructureElement: (state, action: PayloadAction<StructureElement[]>) => {
            state.flattenStructureElement = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(resetStateAction, (state) => {
            state.visibilityIcons = [] as string[];
            state.flattenStructureElement = [] as StructureElement[];
        });
    }
});

export const {
    setVisibilityIconOffValue,
    setFlattenStructureElement
} = IFCViewerSlice.actions;

export default IFCViewerSlice.reducer;