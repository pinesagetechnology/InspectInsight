import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LocalStorageState {
    hasLocalStorage: boolean;
    error: any;
}

const initialState = {
    hasLocalStorage: false
} as LocalStorageState;

const LocalStorageSlice = createSlice({
    name: "LocalStorageState",
    initialState: initialState,
    reducers: {
        setLocalStorageFlag: (state, action: PayloadAction<boolean>) => {
            state.hasLocalStorage = action.payload;
        },
        setLocaStorageError: (state, action: PayloadAction<any>) => {
            state.error = action.payload;
        },
    }
});


export const {
    setLocalStorageFlag,
    setLocaStorageError,
} = LocalStorageSlice.actions;

export default LocalStorageSlice.reducer;