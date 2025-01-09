import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { resetStateAction } from '../Common/actions';
import { InspectionEntity } from '../../entities/inspection';

interface ReviewAndSubmitState {
    inspectionId: string;
    inspectionPayload: InspectionEntity;
    error: any;
}

const initialState = {
} as ReviewAndSubmitState

const ReviewAndSubmitSlice = createSlice({
    name: "ReviewAndSubmitData",
    initialState: initialState,
    reducers: {
        setReviewAndSubmitResult: (state, action: PayloadAction<string>) => {
            state.inspectionId = action.payload;
        },
        setInspectionPayload: (state, action: PayloadAction<InspectionEntity>) => {
            state.inspectionPayload = action.payload;
        },
        setReviewError: (state, action: PayloadAction<string>) => {
            state.inspectionId = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(resetStateAction, (state) => {
            state.inspectionPayload = {} as InspectionEntity;
            state.error = undefined;
            state.inspectionId = "";
            
        });
    }
});

export const {
    setReviewAndSubmitResult,
    setReviewError,
    setInspectionPayload
} = ReviewAndSubmitSlice.actions;

export default ReviewAndSubmitSlice.reducer;