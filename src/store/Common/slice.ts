import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { resetStateAction } from '../Common/actions';

interface loadingOverlayState {
    showLoading: boolean;
}

const initialState = {
    showLoading: false,
} as loadingOverlayState

const LoadingOverlaySlice = createSlice({
    name: "LoadingOverlayState",
    initialState: initialState,
    reducers: {
        setShowLoading: (state, action: PayloadAction<boolean>) => {
            state.showLoading = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(resetStateAction, (state) => {
            state.showLoading = false;
        });
    }
});

export const {
    setShowLoading,
} = LoadingOverlaySlice.actions;

export default LoadingOverlaySlice.reducer;