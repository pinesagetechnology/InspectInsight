import { takeLatest, call, put, select, take } from 'redux-saga/effects';
import * as actions from "./actions";
import { PayloadAction } from '@reduxjs/toolkit';
import { InspectionFomrValidationPayload, InspectionModel } from '../../models/inspectionModel';
import {
    setCurrentInspection,
    setInspectionProcessLoading,
    fetchPreviousInspectionsListSuccessful,
    setPreviousInspectionData,
    setInspectionDataFailure,
    setInspectionFormValidationFlag,
    setPreviousInspectionRatedIFCElements,
    setPreviousInspectionRatedElement,
} from './slice';
import * as services from "../../services/inspectionService";
import { ConditionRatingEntity, InspectionEntity } from "../../entities/inspection";
import { setOriginalConditionRating, setDisplayConditionRatingElements, setReatedElement, setOriginalElementCodeDataList } from '../ConditionRating/slice';
import { getCurrentStructure, getElementsCodeData, getStructureElements } from '../Structure/selectors';
import { ElementCodeData, Structure, StructureElement } from '../../entities/structure';
import { setShowLoading } from '../Common/slice';
import { getFormValidationErrors, getInspection, getPreviousInspectionList } from './selectors';
import { setNextButtonFlag } from '../FormSteps/slice';
import { setGroupedElements } from '../IFCViewer/slice';
import { flattenDataTree, groupElementsByType } from '../../helper/ifcTreeManager';

export function* inspectionRootSaga() {
    yield takeLatest(actions.SET_INSPECTION_DATA, setInspectionValue);
    yield takeLatest(actions.START_INSPECTION_PROCESS, startInspectionProcess);
    yield takeLatest(actions.GET_LIST_INSPECTIONS_DATA, getPreviousInspectionsList);
    yield takeLatest(actions.GET_PREVIOUS_INSPECTION_DATA, getPreviousInspection);
    yield takeLatest(actions.SET_INSPECTION_VALIDATION_FLAG, setInspectionValidation);
}

export function* setInspectionValue(action: PayloadAction<InspectionModel>) {
    yield put(setCurrentInspection(action.payload));
}

export function* startInspectionProcess() {
    yield put(setShowLoading(true));

    const selectedStructure: Structure = yield select(getCurrentStructure);

    yield put(setInspectionProcessLoading(true));

    yield call(getPreviousInspectionValue, selectedStructure.previousInspection);

    yield put(setInspectionProcessLoading(false));

    const flattedListItem: Record<string, StructureElement[]> = yield call(groupElementsByType, selectedStructure.elementMetadata);

    yield put(setGroupedElements(flattedListItem));

    yield put(setShowLoading(false));
}

function* getPreviousInspectionValue(inspection?: InspectionEntity) {
    try {

        const selectedStructureElements: StructureElement[] = yield select(getStructureElements);
        const selectedStructureElmemtsCodeData: ElementCodeData[] = yield select(getElementsCodeData);

        const previousInspection = (inspection) ? inspection : {} as InspectionEntity;
        const elementsWithCondition = getPreviousIFCElementCondirtionrating(selectedStructureElements, (previousInspection?.conditionRatings || []));
        const elementsCodeWithCondition = getPreviousElementCodeConditionRating(selectedStructureElmemtsCodeData, (previousInspection?.conditionRatings || []));

        if (previousInspection?.conditionRatings) {
            yield put(setOriginalConditionRating(elementsWithCondition));

            yield put(setOriginalElementCodeDataList(elementsCodeWithCondition));

            yield put(setDisplayConditionRatingElements(elementsWithCondition));

            const result = [] as StructureElement[];

            yield call(getPreviousIFCRatedElement, selectedStructureElements, (previousInspection.conditionRatings || []), result);

            yield put(setReatedElement(result));
        } else {
            yield put(setOriginalConditionRating(selectedStructureElements));

            yield put(setOriginalElementCodeDataList(selectedStructureElmemtsCodeData));

            yield put(setDisplayConditionRatingElements(selectedStructureElements));
        }
    }
    catch (error: any) {
        if (error instanceof Error) {
            yield put(setInspectionDataFailure(error.message));

        } else {
            yield put(setInspectionDataFailure(error));

        }
    }
}

const getPreviousIFCElementCondirtionrating = (selectedStructureElements: StructureElement[], previousConditionRating: ConditionRatingEntity[]) => {
    if (previousConditionRating) {
        return selectedStructureElements?.map(element => {
            if (element.children && element.children.length > 0) {
                const updatedChildren: StructureElement[] = getPreviousIFCElementCondirtionrating(element.children, previousConditionRating);
                return { ...element, children: updatedChildren }
            } else {
                const foundCondition = (previousConditionRating || [])?.find((x) => x.elementId === element.data.expressID.toString());
                if (foundCondition) {
                    const index = foundCondition.ratings?.findIndex(x => x === 1) || 0;
                    return { ...element, condition: [...foundCondition.ratings], ifcElementRatingValue: index.toString() } as StructureElement
                }
            }

            return element;
        });
    }

    return selectedStructureElements;
}

const getPreviousElementCodeConditionRating = (selectedElementsCodeData: ElementCodeData[], previousConditionRating: ConditionRatingEntity[]) => {
    if (previousConditionRating) {
        return selectedElementsCodeData?.map(element => {
            const foundCondition = (previousConditionRating || [])?.find((x) => x.elementCode === element.elementCode);
            if (foundCondition) {
                return { ...element, condition: [...foundCondition.ratings] }
            }
            return element;
        });
    }

    return selectedElementsCodeData;
}

export function* getPreviousInspectionsList() {
    yield put(setShowLoading(true));

    yield put(setNextButtonFlag(false));

    const selectedStructure: Structure = yield select(getCurrentStructure);

    const inspections: InspectionEntity[] = yield call(services.fetchListOfPreviousInspections, selectedStructure.id);

    yield put(fetchPreviousInspectionsListSuccessful(inspections));

    yield put(setShowLoading(false));
}

export function* getPreviousInspection(action: PayloadAction<string>) {
    const inspectionId = action.payload;

    var listofInspections: InspectionEntity[] = yield select(getPreviousInspectionList);

    const selectedInspection = listofInspections.find(x => x.id === inspectionId) || {} as InspectionEntity;

    const selectedStructureElements: StructureElement[] = yield select(getStructureElements);
    const selectedStructureElmemtsCodeData: ElementCodeData[] = yield select(getElementsCodeData);

    const ifcElementResult = [] as StructureElement[];
    const elementsCodeWithCondition = [] as ElementCodeData[];

    if (selectedStructureElements && selectedStructureElements.length > 0) {

        yield call(getPreviousIFCRatedElement, selectedStructureElements, (selectedInspection.conditionRatings || []), ifcElementResult);

        yield put(setPreviousInspectionRatedIFCElements(ifcElementResult));
    } else if (selectedStructureElmemtsCodeData && selectedStructureElmemtsCodeData.length > 0) {
        yield call(previousRatedElementData, selectedStructureElmemtsCodeData, (selectedInspection.conditionRatings || []), elementsCodeWithCondition);

        yield put(setPreviousInspectionRatedElement(elementsCodeWithCondition));
    }

    yield put(setPreviousInspectionData(selectedInspection));
}

const getPreviousIFCRatedElement = (selectedStructureElements: StructureElement[], previousConditionRating: ConditionRatingEntity[], output: StructureElement[]) => {
    if (previousConditionRating.length > 0) {
        for (const element of selectedStructureElements) {
            if (element.children && element.children.length > 0) {
                getPreviousIFCRatedElement(element.children, previousConditionRating, output);
            } else {
                const foundCondition = (previousConditionRating || [])?.find((x) => x.elementId === element.data.expressID.toString());
                if (foundCondition) {
                    const index = foundCondition.ratings?.findIndex(x => x === 1) || 0;
                    output.push({ ...element, condition: [...foundCondition.ratings], ifcElementRatingValue: index.toString() })
                }
            }
        }
    }
    return output;
}

const previousRatedElementData = (selectedStructureElmemtsCodeData: ElementCodeData[], previousConditionRating: ConditionRatingEntity[], output: ElementCodeData[]) => {
    if (previousConditionRating.length > 0) {
        for (const element of selectedStructureElmemtsCodeData) {
            const foundCondition = (previousConditionRating || [])?.find((x) => x.elementCode === element.elementCode);
            if (foundCondition) {
                output.push({ ...element, condition: [...foundCondition.ratings] })
            }
        }
    }
    return output;
}

export function* setInspectionValidation(action: PayloadAction<InspectionFomrValidationPayload>) {
    const validationerrors: string[] = yield select(getFormValidationErrors);
    const inspectionDetail: InspectionModel = yield select(getInspection);

    const validateField = (name: string, value: any): boolean => {
        switch (name) {
            case 'inspectionLevel':
            case 'inspectionType':
            case 'weather':
                return Boolean(value && value.trim());
            case 'temperature':
                const temp = parseFloat(value);
                return !isNaN(temp) && temp >= -100 && temp <= 100;
            case 'inspectionDate':
            case 'nextInspectionProposedDate':
                return Boolean(value && new Date(value).toString() !== 'Invalid Date');
            case 'inspectorName':
            case 'engineerName':
                return Boolean(value && value.trim().length >= 2);
            default:
                return Boolean(value);
        }
    };

    const isValid = validateField(action.payload.name, action.payload.value);
    
    if (isValid) {
        // Remove field from validation errors if it's valid
        const updatedList = validationerrors.filter(x => x !== action.payload.name);
        yield put(setInspectionFormValidationFlag(updatedList));
    } else {
        // Add field to validation errors if it's invalid and not already there
        const hasValidated = validationerrors.some(x => x === action.payload.name);
        if (!hasValidated) {
            yield put(setInspectionFormValidationFlag([...validationerrors, action.payload.name]));
        }
    }

    // Check if all required fields are valid
    const requiredFields = [
        'inspectionLevel',
        'inspectionType',
        'weather',
        'temperature',
        'inspectionDate',
        'nextInspectionProposedDate',
        'inspectorName',
        'engineerName'
    ];

    const allFieldsValid = requiredFields.every(field => validateField(field, inspectionDetail[field as keyof InspectionModel]));
    yield put(setNextButtonFlag(allFieldsValid));
}