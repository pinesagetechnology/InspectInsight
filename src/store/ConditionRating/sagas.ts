import { takeLatest, call, put, select } from 'redux-saga/effects';
import * as actions from "./actions";
import { PayloadAction } from '@reduxjs/toolkit';
import { StructureElement } from '../../entities/structure';
import { getConditionRating, getDisplayElementList, getElementHistory, getRatedElements } from './selectors';
import { setOriginalConditionRating, setDisplayConditionRatingElements, setElementHistory, setSelectedStructureElement, setConditionRatingError, setReatedElement } from './slice';
import { InspectionModel, MaintenanceActionModel } from 'models/inspectionModel';
import { getInspection } from '../Inspection/selectors';
import { getMaintenanceAction } from '../MaintenanceAction/selectors';
import * as services from "../../services/inspectionService";
import { ConditionRatingEntity, InspectionEntity } from '../../entities/inspection';

export function* conditionRatingRootSaga() {
    yield takeLatest(actions.HANDLE_ROW_CLICK_SAGA, handleRowClickSaga);
    yield takeLatest(actions.HANDLE_BACK_CLICK_SAGA, handleBackClickSaga);
    yield takeLatest(actions.SAVE_CONDITION_RATING_DATA, saveConditionRatingValue);
    yield takeLatest(actions.UPDATE_DISPLAY_LIST_ITEMS, updateDisplayListItem);
    yield takeLatest(actions.SET_SELECTED_STRUCTURE_ELEMENT, setSelectedElement);
    yield takeLatest(actions.SAVE_CONDITION_RATING_ASSESSMENT_DATA, saveConditionRatingAssessmentData);
    yield takeLatest(actions.RESET_CONDITION_RATING_DISPLAY_TABLE, resetConditionRatingDisplayTableSaga);
}

export function* handleRowClickSaga(action: PayloadAction<StructureElement>) {

    if (action.payload.children && action.payload.children.length > 0) {
        // 1- current diplay go to add history
        const currentDisplayItem: StructureElement[] = yield select(getDisplayElementList);

        //add element to History
        const elementHistory: StructureElement[][] = yield select(getElementHistory);

        let updatedList = [...elementHistory, [...currentDisplayItem]]

        yield put(setElementHistory(updatedList));

        // 2- selt children of selected row as display
        yield put(setDisplayConditionRatingElements(action.payload.children));
    }
}

export function* saveConditionRatingValue(action: PayloadAction<StructureElement>) {
    // update original list
    yield call(updateOrginalElementList, action.payload);

    // update display
    yield call(updateDisplayElementList, action.payload);

    //update historyList
    yield call(updateHistoryElementList, action.payload);

    //upted RatedElement
    yield call(updateRatedElementList, action.payload);
}

function* updateOrginalElementList(updatedItem: StructureElement) {
    const elementItems: StructureElement[] = yield select(getConditionRating);

    let reuslt: StructureElement[] = yield call(CheckHierarchyRecusrsivly, elementItems, updatedItem);

    yield put(setOriginalConditionRating(reuslt));
}

const CheckHierarchyRecusrsivly = (items: StructureElement[], updatedItem: StructureElement) => {
    return items.map(item => {
        if (item.elementId === updatedItem.elementId) {
            return updatedItem;
        } else if (item.children && item.children.length > 0) {
            const updatedChildren: StructureElement[] = CheckHierarchyRecusrsivly(item.children, updatedItem);
            return { ...item, children: updatedChildren }
        }

        return item;
    });
}

function* updateDisplayElementList(updatedItem: StructureElement) {
    const displayItems: StructureElement[] = yield select(getDisplayElementList);

    const updateDisplayItems = displayItems.map(item => {
        if (!item.children?.length && item.elementId === updatedItem.elementId) {
            return updatedItem;
        }

        return item;
    })

    yield put(setDisplayConditionRatingElements(updateDisplayItems));
}

function* updateHistoryElementList(updatedItem: StructureElement) {
    const elementHistory: StructureElement[][] = yield select(getElementHistory);

    const newElementHistory = elementHistory.map(elementSet => {
        return CheckHierarchyRecusrsivly(elementSet, updatedItem);
    });

    yield put(setElementHistory(newElementHistory));
}

function* updateRatedElementList(updatedItem: StructureElement) {
    const ratedElements: StructureElement[] = yield select(getRatedElements);

    const existingItem = ratedElements.find(item => item.elementId === updatedItem.elementId);
    if (existingItem) {
        const updatedList = ratedElements.map(item => {
            if (item.elementId === updatedItem.elementId) {
                return updatedItem;
            } else {
                return item;
            }
        });

        yield put(setReatedElement(updatedList));
    } else {
        yield put(setReatedElement([...ratedElements, updatedItem]));
    }
}

export function* handleBackClickSaga() {
    const elementHistory: StructureElement[][] = yield select(getElementHistory);
    if (elementHistory.length > 0) {
        const lastArrayIndex = elementHistory.length - 1;
        const lastElementArray = elementHistory[lastArrayIndex];

        //1- set displayElement to last item in history
        yield put(setDisplayConditionRatingElements(lastElementArray));

        //2- pop last history item 
        const newElementHistory = elementHistory.slice(0, -1);
        yield put(setElementHistory(newElementHistory));
    }

}

export function* updateDisplayListItem(action: PayloadAction<StructureElement[]>) {
    yield put(setDisplayConditionRatingElements(action.payload));
}

export function* setSelectedElement(action: PayloadAction<StructureElement>) {
    yield put(setSelectedStructureElement(action.payload));
}

export function* saveConditionRatingAssessmentData() {
    try {
        const inspectionData: InspectionModel = yield select(getInspection);
        const maintenanceActions: MaintenanceActionModel[] = yield select(getMaintenanceAction);
        const conditionRatings: ConditionRatingEntity[] = yield select(getConditionRating);

        const newInspectionEntity = {
            ...inspectionData,
            maintenanceActions: [...maintenanceActions],
            conditionRatings: conditionRatings
        } as InspectionEntity;

        yield call(services.updateInspectionlData, newInspectionEntity);
    }
    catch (error: any) {
        if (error instanceof Error) {
            yield put(setConditionRatingError(error.message));

        } else {
            yield put(setConditionRatingError(error));

        }
    }

}

export function* resetConditionRatingDisplayTableSaga() {
    const elementHistory: StructureElement[][] = yield select(getElementHistory);
    if (elementHistory?.length > 0) {
        //1- set displayElement to first item in the hitory
        yield put(setDisplayConditionRatingElements(elementHistory[0]));

        //2- clear history
        yield put(setElementHistory([] as StructureElement[][]));
    }
}