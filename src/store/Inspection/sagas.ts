import { takeLatest, call, put, select, take } from 'redux-saga/effects';
import * as actions from "./actions";
import { PayloadAction } from '@reduxjs/toolkit';
import { InspectionFomrValidationPayload, InspectionModel } from '../../models/inspectionModel';
import {
    setCurrentInspection,
    fetchPreviousInspectionData,
    setInspectionProcessLoading,
    fetchPreviousInspectionDataSuccessful,
    setInspectionDataFailure,
    setPreviousRatedElements,
    setInspectionFormValidationFlag
} from './slice';
import * as services from "../../services/inspectionService";
import { ConditionRatingEntity, InspectionEntity } from "../../entities/inspection";
import { setOriginalConditionRating, setDisplayConditionRatingElements } from '../ConditionRating/slice';
import { getCurrentStructure, getStructureElements } from '../Structure/selectors';
import { Structure, StructureElement } from '../../entities/structure';
import { setShowLoading } from '../Common/slice';
import { getFormValidationErrors } from './selectors';
import { setNextButtonFlag } from '../FormSteps/slice';

export function* inspectionRootSaga() {
    yield takeLatest(actions.SET_INSPECTION_DATA, setInspectionValue);
    yield takeLatest(actions.START_INSPECTION_PROCESS, startInspectionProcess);
    yield takeLatest(actions.REVIEW_PREVIOUS_INSPECTION_DATA, getReviewPreviousInspection);
    yield takeLatest(actions.SET_INSPECTION_VALIDATION_FLAG, setInspectionValidation);
}

export function* setInspectionValue(action: PayloadAction<InspectionModel>) {
    yield put(setCurrentInspection(action.payload));
}

export function* startInspectionProcess() {
    yield put(setShowLoading(true));

    const selectedStructure: Structure = yield select(getCurrentStructure);

    yield put(setInspectionProcessLoading(true));

    yield call(getPreviousInspectionValue, selectedStructure.id);

    yield put(setInspectionProcessLoading(false));

    yield put(setShowLoading(false));
}

function* getPreviousInspectionValue(id: string) {
    try {
        yield put(fetchPreviousInspectionData());

        const inspections: InspectionEntity[] = yield call(services.fetchPreviousInspectionData, id);
        const previousInspection = (inspections && inspections.length > 0) ? inspections[0] : {} as InspectionEntity;
        const selectedStructureElements: StructureElement[] = yield select(getStructureElements);
        const elementsWithCondition = setPreviousCondirtionrating(selectedStructureElements, (previousInspection?.conditionRatings || []));

        if (previousInspection?.conditionRatings) {
            yield put(setOriginalConditionRating(elementsWithCondition));

            yield put(setDisplayConditionRatingElements(elementsWithCondition));
        } else {
            yield put(setOriginalConditionRating(selectedStructureElements));

            yield put(setDisplayConditionRatingElements(selectedStructureElements));
        }

        yield put(fetchPreviousInspectionDataSuccessful(previousInspection));
    }
    catch (error: any) {
        if (error instanceof Error) {
            yield put(setInspectionDataFailure(error.message));

        } else {
            yield put(setInspectionDataFailure(error));

        }
    }
}

const setPreviousCondirtionrating = (selectedStructureElements: StructureElement[], previousConditionRating: ConditionRatingEntity[]) => {
    if (previousConditionRating) {
        return selectedStructureElements?.map(element => {
            if (element.children && element.children.length > 0) {
                const updatedChildren: StructureElement[] = setPreviousCondirtionrating(element.children, previousConditionRating);
                return { ...element, children: updatedChildren }
            } else {
                const foundCondition = (previousConditionRating || [])?.find((x) => x.elementId === element.data.expressID);
                if (foundCondition) {
                    return { ...element, condition: [...foundCondition.ratings] }
                }
            }

            return element;
        });
    }

    return selectedStructureElements;
}

export function* getReviewPreviousInspection() {
    yield put(setShowLoading(true));

    yield put(setNextButtonFlag(false));

    const selectedStructure: Structure = yield select(getCurrentStructure);
    const selectedStructureElements: StructureElement[] = yield select(getStructureElements);
    const inspections: InspectionEntity[] = yield call(services.fetchPreviousInspectionData, selectedStructure.id);
    const previousInspection = (inspections && inspections.length > 0) ? inspections[0] : {} as InspectionEntity;
    const result = [] as StructureElement[];

    yield call(getPreviousRatedElement, selectedStructureElements, (previousInspection.conditionRatings || []), result);

    yield put(setPreviousRatedElements(result));

    yield put(fetchPreviousInspectionDataSuccessful(previousInspection));

    yield put(setShowLoading(false));
}

const getPreviousRatedElement = (selectedStructureElements: StructureElement[], previousConditionRating: ConditionRatingEntity[], output: StructureElement[]) => {
    if (previousConditionRating.length > 0) {
        for (const element of selectedStructureElements) {
            if (element.children && element.children.length > 0) {
                getPreviousRatedElement(element.children, previousConditionRating, output);
            } else {
                const foundCondition = (previousConditionRating || [])?.find((x) => x.elementId === element.data.expressID);
                if (foundCondition) {
                    output.push({ ...element, condition: [...foundCondition.ratings] })
                }
            }
        }
    }
    return output;
}

export function* setInspectionValidation(action: PayloadAction<InspectionFomrValidationPayload>) {
    const validationerrors: string[] = yield select(getFormValidationErrors);

    if (action.payload.value) {
        const updatedList = validationerrors.filter(x => x !== action.payload.name);
        yield put(setInspectionFormValidationFlag(updatedList));

    } else if (!action.payload.value) {
        const hasValidated = validationerrors.some(x => x === action.payload.name);

        if (!hasValidated) {
            yield put(setInspectionFormValidationFlag([...validationerrors, action.payload.name]));
        }
    }
}