import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { resetStateAction } from '../Common/actions';
import { AISource, AISourceStatus } from '../../models/webllm';

export interface InspectionCommentState {
    inspectionComment: string;
    validationErrorsFlag: boolean;
    error: any;
    aiSourceStatus: AISourceStatus;
    aiSource: AISource;
}

const initialState = {
    inspectionComment: "",
    aiSourceStatus: {},
    aiSource: 'online'
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
        },
        setAiSourceStatus: (state, action: PayloadAction<AISourceStatus>) => {
            state.aiSourceStatus = action.payload;
        },
        setAiSource: (state, action: PayloadAction<AISource>) => {
            state.aiSource = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(resetStateAction, (state) => {
            state.inspectionComment = "";
            state.validationErrorsFlag = false;
            state.error = "";
            state.aiSourceStatus = {} as AISourceStatus;
            state.aiSource = 'online';
        });
    }
});

export const {
    setInspectionComment,
    setValidationErrorFlag,
    setInspectionCommentError,
    setAiSourceStatus,
    setAiSource
} = InspectionCommentSlice.actions;

export default InspectionCommentSlice.reducer;