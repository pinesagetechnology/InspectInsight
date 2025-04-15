import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { resetStateAction } from '../Common/actions';

export interface IFCViewerState {
    visibilityIcons: string[];
    error?: any;
}

const initialState = {
    visibilityIcons: [],
} as IFCViewerState

const IFCViewerSlice = createSlice({
    name: "IFCViewerState",
    initialState: initialState,
    reducers: {
        setVisibilityIconOffValue: (state, action: PayloadAction<string[]>) => {
            state.visibilityIcons = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(resetStateAction, (state) => {
            state.visibilityIcons = [] as string[];
        });
    }
});

export const {
    setVisibilityIconOffValue
} = IFCViewerSlice.actions;

export default IFCViewerSlice.reducer;