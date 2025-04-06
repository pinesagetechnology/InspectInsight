import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { resetStateAction } from '../Common/actions';

export interface InspectionCommentState {
    inspectionComment: string;
    validationErrorsFlag: boolean;
    error: any;
}

const initialState = {
    inspectionComment: ""
} as InspectionCommentState

const InspectionCommentSlice = createSlice({
    name: "InspectionCommentDataState",
    initialState: initialState,
    reducers: {
        setInspectionComment: (state, action: PayloadAction<string>) => {
            state.inspectionComment = action.payload;
        },
        setInspectionCommentError: (state, action: PayloadAction<any>) => {
            state.error = action.payload;
        },
        setValidationErrorFlag: (state, action: PayloadAction<boolean>) => {
            state.validationErrorsFlag = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(resetStateAction, (state) => {
            state.inspectionComment = "";
            state.validationErrorsFlag = false;
            state.error = "";
        });
    }
});

export const {
    setInspectionComment,
    setValidationErrorFlag,
    setInspectionCommentError,
} = InspectionCommentSlice.actions;

export default InspectionCommentSlice.reducer;