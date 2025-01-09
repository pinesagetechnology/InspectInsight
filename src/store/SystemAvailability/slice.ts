import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SystemStatus } from "models/systemAvailability";
import { resetStateAction } from "../Common/actions";

const initialState: SystemStatus = {
    isOnline: true,
    lastChecked: Date.now()
};

const SystemAvailabilitySlice = createSlice({
    name: "SystemAvailabilityState",
    initialState: initialState,
    reducers: {
        setSystemAvailability: (state, action: PayloadAction<boolean>) => {
            state.isOnline = action.payload;
            state.lastChecked = Date.now();
        }
    },
    extraReducers: (builder) => {
        builder.addCase(resetStateAction, (state) => {
            // state.currentStructure = {} as Structure;
        });
    }
});

export const {
    setSystemAvailability
} = SystemAvailabilitySlice.actions;

export default SystemAvailabilitySlice.reducer;