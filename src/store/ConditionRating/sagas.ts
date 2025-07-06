import { takeLatest, call, put, select } from 'redux-saga/effects';
import * as actions from "./actions";
import { PayloadAction } from '@reduxjs/toolkit';
import { ElementCodeData, StructureElement } from '../../entities/structure';
import { getOriginalConditionRating, getDisplayElementList, getElementCodeDataList, getElementHistory, getRatedElementCodeData, getRatedElements, getSelectedHierarchyPath } from './selectors';
import { setOriginalConditionRating, setDisplayConditionRatingElements, setElementHistory, setSelectedStructureElement, setConditionRatingError, setReatedElement, setSelectedElementCode, setOriginalElementCodeDataList, setReatedElementCode, setAutoTableElementFocus, setSelectedHierarchyPath } from './slice';
import { InspectionModel, MaintenanceActionModel } from 'models/inspectionModel';
import { getInspection } from '../Inspection/selectors';
import { getMaintenanceActions } from '../MaintenanceAction/selectors';
import * as services from "../../services/inspectionService";
import { ConditionRatingEntity, InspectionEntity } from '../../entities/inspection';
import { InspectionStatusEnum } from '../../enums';

export function* conditionRatingRootSaga() {
    yield takeLatest(actions.HANDLE_ROW_CLICK_SAGA, handleRowClickSaga);
    yield takeLatest(actions.HANDLE_BACK_CLICK_SAGA, handleBackClickSaga);
    yield takeLatest(actions.SAVE_CONDITION_RATING_DATA, saveConditionRatingValue);
    yield takeLatest(actions.UPDATE_DISPLAY_LIST_ITEMS, updateDisplayListItem);
    yield takeLatest(actions.SET_SELECTED_STRUCTURE_ELEMENT, setSelectedElement);
    yield takeLatest(actions.RESET_CONDITION_RATING_DISPLAY_TABLE, resetConditionRatingDisplayTableSaga);
    yield takeLatest(actions.SET_SELECTED_IFC_ELEMENT_ID, setSelectedElementIdSaga);
    yield takeLatest(actions.SET_SELECTED_ELEMENT_CODE, setSelectedElementCodeSaga);
    yield takeLatest(actions.SAVE_ELEMENT_CODE_LIST, saveElementCodeListSaga);
    yield takeLatest(actions.SET_AUTO_TABLE_ELEMENT_FOCUS, setAutoTableElementFocusSaga);
}

export function* handleRowClickSaga(action: PayloadAction<StructureElement>) {

    if (action.payload.children && action.payload.children.length > 0) {
        //set hierarchy path
        const selectedHierarchyPath: string[] = yield select(getSelectedHierarchyPath);
        const newHierarchyPath = [...selectedHierarchyPath, `${action.payload.data.Entity}|${action.payload.data.expressID}`];
        yield put(setSelectedHierarchyPath(newHierarchyPath));

        // current diplay go to add history
        const currentDisplayItem: StructureElement[] = yield select(getDisplayElementList);

        //add element to History
        const elementHistory: StructureElement[][] = yield select(getElementHistory);

        let updatedList = [...elementHistory, [...currentDisplayItem]]

        yield put(setElementHistory(updatedList));

        // 2- set children of selected row as display
        yield put(setDisplayConditionRatingElements(action.payload.children));
    }
}

export function* saveConditionRatingValue(action: PayloadAction<StructureElement>) {
    // update original list
    yield call(updateOriginalElementList, action.payload);

    // update display
    yield call(updateDisplayElementList, action.payload);

    //upted RatedElement
    yield call(updateRatedElementList, action.payload);
}

function* updateOriginalElementList(updatedItem: StructureElement) {
    const elementItems: StructureElement[] = yield select(getOriginalConditionRating);

    let reuslt: StructureElement[] = yield call(CheckHierarchyRecusrsivly, elementItems, updatedItem);

    yield put(setOriginalConditionRating(reuslt));
}

const CheckHierarchyRecusrsivly = (items: StructureElement[], updatedItem: StructureElement) => {
    return items.map(item => {
        if (item.data.expressID === updatedItem.data.expressID) {
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
        if (!item.children?.length && item.data.expressID === updatedItem.data.expressID) {
            return updatedItem;
        }

        return item;
    })

    yield put(setDisplayConditionRatingElements(updateDisplayItems));
}

function* updateRatedElementList(updatedItem: StructureElement) {
    const ratedElements: StructureElement[] = yield select(getRatedElements);

    const existingItem = ratedElements.find(item => item.data.expressID === updatedItem.data.expressID);
    if (existingItem) {
        const updatedList = ratedElements.map(item => {
            if (item.data.expressID === updatedItem.data.expressID) {
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

        const selectedHierarchyPath: string[] = yield select(getSelectedHierarchyPath);
        const lastItem = selectedHierarchyPath[selectedHierarchyPath.length - 1];
        const updatedItemExpressID = lastItem.split('|')[1];

        const lastArrayIndex = elementHistory.length - 1;
        const lastElementArray = elementHistory[lastArrayIndex];

        //update children of the selected item with latest CurrentDisplay item 
        const currentDisplayItem: StructureElement[] = yield select(getDisplayElementList);

        const updatedLastElementArray = lastElementArray.map(item => {
            if (item.data.expressID === Number(updatedItemExpressID)) {
                return { ...item, children: currentDisplayItem };
            }
            return item;
        });

        //1- set displayElement to last item in history
        yield put(setDisplayConditionRatingElements(updatedLastElementArray));

        //2- pop last history items
        const newHierarchyPath = selectedHierarchyPath.slice(0, -1);
        yield put(setSelectedHierarchyPath(newHierarchyPath));

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
        const maintenanceActions: MaintenanceActionModel[] = yield select(getMaintenanceActions);
        const conditionRatings: ConditionRatingEntity[] = yield select(getOriginalConditionRating);

        const newInspectionEntity = {
            ...inspectionData,
            maintenanceActions: [...maintenanceActions],
            conditionRatings: conditionRatings,
            inspectionStatus: InspectionStatusEnum.ToDo
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
        const elementItems: StructureElement[] = yield select(getOriginalConditionRating);

        yield put(setDisplayConditionRatingElements(elementItems));

        //2- clear history
        yield put(setElementHistory([] as StructureElement[][]));
    }
}

const findElement = (elements: StructureElement[], id: number): StructureElement | undefined => {
    for (let i = 0; i < elements.length; i++) {
        const item = elements[i];
        if (item.data.expressID === id) {
            return { ...item, originalIndex: i };
        }

        if (item.children && item.children.length > 0) {
            const foundInChildren = findElement(item.children, id);
            if (foundInChildren) {
                return foundInChildren;
            }
        }
    }
    return undefined;
}

export function* setSelectedElementIdSaga(action: PayloadAction<number | undefined>) {
    const ratedElements: StructureElement[] = yield select(getRatedElements);
    let selectedElement = ratedElements?.find(element => element.data.expressID === action.payload);

    if (!selectedElement) {
        const originalConditionRating: StructureElement[] = yield select(getOriginalConditionRating);
        selectedElement = findElement(originalConditionRating, action.payload!);
    }
    yield put(setSelectedStructureElement(selectedElement || ({} as StructureElement)));
}

export function* setSelectedElementCodeSaga(action: PayloadAction<ElementCodeData>) {
    yield put(setSelectedElementCode(action.payload));
}

export function* saveElementCodeListSaga(action: PayloadAction<ElementCodeData>) {
    const originalElementCodeData: ElementCodeData[] = yield select(getElementCodeDataList);

    const updatedElementCodeData = originalElementCodeData.map(item => {
        return item.elementCode === action.payload.elementCode ? action.payload : item
    }) as ElementCodeData[];

    yield put(setOriginalElementCodeDataList(updatedElementCodeData));

    const ratedElementCodeData: ElementCodeData[] = yield select(getRatedElementCodeData);
    //add or update ratedElementCodeData 
    let updatedRatedElementCodeData: ElementCodeData[] = [];
    const existingItem = ratedElementCodeData.find(item => item.elementCode === action.payload.elementCode);
    if (existingItem) {
        updatedRatedElementCodeData = ratedElementCodeData.map(item => {
            if (item.elementCode === action.payload.elementCode) {
                return action.payload;
            }
            return item;
        }) as ElementCodeData[];
    } else {
        updatedRatedElementCodeData = [...ratedElementCodeData, action.payload] as ElementCodeData[];
    }

    yield put(setReatedElementCode(updatedRatedElementCodeData));
}

export function* setAutoTableElementFocusSaga(action: PayloadAction<number>) {
    yield put(setAutoTableElementFocus(action.payload));
}

