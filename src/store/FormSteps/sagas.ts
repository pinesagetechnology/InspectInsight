import { takeLatest, call, put, select, takeLeading } from 'redux-saga/effects';
import * as actions from "./actions";
import { setCurrentStep, setNextButtonFlag, setSteps } from './slice';
import { PayloadAction } from '@reduxjs/toolkit';
import { StepModel } from '../../models/steps';
import { getStepsState, isAllStepsCompleted } from './selectors';
import { getInspection } from '../Inspection/selectors';
import { InspectionModel } from '../../models/inspectionModel';
import { getConditionRating } from '../ConditionRating/selectors';
import { getInspectionComment } from '../InspectionComment/selectors';
import { StructureElement } from '../../entities/structure';

export function* stepsRootSaga() {
    yield takeLatest(actions.SET_NEXT_STEP, setNextStepValue);
    yield takeLatest(actions.SET_BACK_STEP, setBackStepValue);
    yield takeLatest(actions.SET_ACTIVE_STEP, setActiveStep);
    yield takeLatest(actions.SET_REVIEW_COMPLETE, setReviewPageAsComplete);
    yield takeLeading(actions.SET_NEXT_HEADER_BUTTON, setNextButtonVisibiiity);
}

export function* setNextStepValue(action: PayloadAction<number>) {
    const stepList: StepModel[] = yield select(getStepsState);

    const updatedSteps: StepModel[] = [];
    for (const item of stepList) {
        const result: boolean = yield call(checkStepDataIsComplete, item.index);

        if (item.index === action.payload) {
            updatedSteps.push({ ...item, isCompleted: result });
        } else {
            updatedSteps.push(item);
        }
    }

    yield put(setSteps(updatedSteps));
    yield put(setCurrentStep(action.payload + 1));
}

export function* setBackStepValue(action: PayloadAction<number>) {
    yield put(setCurrentStep(action.payload - 1));
}

export function* setActiveStep(action: PayloadAction<number>) {
    const stepList: StepModel[] = yield select(getStepsState);

    const updatedSteps: StepModel[] = [];
    for (const item of stepList) {
        const result: boolean = yield call(checkStepDataIsComplete, item.index);
        if (item.index === action.payload) {
            updatedSteps.push({ ...item, isCompleted: result });
        } else {
            updatedSteps.push(item);
        }
    }

    yield put(setSteps(updatedSteps));
    yield put(setCurrentStep(action.payload));
}

function* checkStepDataIsComplete(index: number) {
    switch (index) {
        case 0:
            var inspection: InspectionModel = yield select(getInspection);

            if (inspection.engineerName && inspection.inspectorName &&
                inspection.inspectionDate && inspection.nextInspectionProposedDate &&
                inspection.inspectionLevel && inspection.inspectionType &&
                inspection.temperature && inspection.weather
            ) {
                return true
            } else {
                return false;
            }
        case 1:
            const conditionRating: StructureElement[] = yield select(getConditionRating);
            if (conditionRating?.length > 0) {
                return true;
            }
            return false;
        case 2:
            const inspectionComment: string = yield select(getInspectionComment);
            return inspectionComment ? true : false;
        default:
            return false;
    }
}

export function* setReviewPageAsComplete() {
    const stepList: StepModel[] = yield select(getStepsState);
    const lastIndex = stepList.length;
    const flag: boolean = yield select(isAllStepsCompleted);

    const updateList = stepList.map(step => {
        if (step.index === (lastIndex - 1)) {
            return { ...step, isCompleted: flag }
        } else {
            return step;
        }
    });

    yield put(setSteps(updateList));
}

export function* setNextButtonVisibiiity(action: PayloadAction<boolean>) {
    yield put(setNextButtonFlag(action.payload));
}