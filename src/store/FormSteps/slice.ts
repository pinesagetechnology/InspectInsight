import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StepModel } from "../../models/steps";
import { RoutesValueEnum } from "../../enums";
import { resetStateAction } from '../Common/actions';

interface StepsState {
    steps: StepModel[];
    currentStep: number;
    hasError: boolean;
    error?: any;
}

const initialStepsData = [
    { index: 0, path: `${RoutesValueEnum.InspectionDetail}`, label: 'Inspection Detail', isCompleted: false },
    { index: 1, path: `${RoutesValueEnum.ConditionRating}`, label: 'Condition Rating', isCompleted: false },
    { index: 2, path: `${RoutesValueEnum.InspectorComments}`, label: 'Inspector Comments', isCompleted: false },
    { index: 3, path: `${RoutesValueEnum.InspectionReview}`, label: 'Review and Submit', isCompleted: false },
];

const initialState = {
    steps: initialStepsData,
    currentStep: 0,
    hasError: false,
} as StepsState

const StepsSlice = createSlice({
    name: "StepDataState",
    initialState: initialState,
    reducers: {
        setCurrentStep: (state, action: PayloadAction<number>) => {
            state.currentStep = action.payload;
        },
        setSteps: (state, action: PayloadAction<StepModel[]>) => {
            state.steps = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(resetStateAction, (state) => {
            state.currentStep = 0;
            state.steps = initialStepsData;
        })
    }
});

export const {
    setCurrentStep,
    setSteps
} = StepsSlice.actions;

export default StepsSlice.reducer;