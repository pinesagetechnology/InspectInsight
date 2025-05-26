import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { resetStateAction } from '../Common/actions';
import { StructureElement } from '../../entities/structure';

export interface IFCViewerState {
    visibilityIcons: string[];
    groupedElements: Record<string, StructureElement[]>;
    error?: any;
}

const initialState = {
    visibilityIcons: [],
    groupedElements: {}
} as IFCViewerState

const IFCViewerSlice = createSlice({
    name: "IFCViewerState",
    initialState: initialState,
    reducers: {
        setVisibilityIconOffValue: (state, action: PayloadAction<string[]>) => {
            state.visibilityIcons = action.payload;
        },
        setGroupedElements: (state, action: PayloadAction<Record<string, StructureElement[]>>) => {
            state.groupedElements = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(resetStateAction, (state) => {
            state.visibilityIcons = [] as string[];
            state.groupedElements = {};
        });
    }
});

export const {
    setVisibilityIconOffValue,
    setGroupedElements
} = IFCViewerSlice.actions;

export default IFCViewerSlice.reducer;