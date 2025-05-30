import { takeLatest, call, put, select } from 'redux-saga/effects';
import * as actions from "./actions";
import { PayloadAction } from '@reduxjs/toolkit';
import { ClaculatedIFCElementCodeData, Structure, StructureElement } from '../../entities/structure';
import {
    fetchStructuresData,
    setCurrentStructure,
    structuresDataFailed,
    fetchStructuresDataSuccessful,
    setStructureDisplayMode
} from './slice';
import * as services from "../../services/structureService";
import { setShowLoading } from '../Common/slice';
import * as commonActions from '../Common/actions';
import { addQuantityToElements, flattenDataTree, getMetaDataFromIFCStructureElement } from '../../helper/ifcTreeManager';
import { isOnlineSelector } from '../SystemAvailability/selectors';
import { db, hasIFCFile, StructureState } from '../../helper/db';
import { setPreviousInspectionData } from '../Inspection/slice';
import { InspectionEntity } from '../../entities/inspection';
import { StructureUrgencyEnum } from '../../enums';
import { defaultDateValue } from '../../constants';

export function* structureRootSaga() {
    yield takeLatest(actions.SET_SLECTED_STRUCTURE_DATA, setCurrentStructureValue);

    yield takeLatest(actions.FETCH_STRUCTURES_DATA, getStructursData);

    yield takeLatest(actions.SET_STRUCTURE_DISPLAY_MODE, setStructureDisplayModeSaga);
}

export function* setCurrentStructureValue(action: PayloadAction<Structure>) {
    yield put(commonActions.resetStateAction());

    const updatedMetadata = addQuantityToElements(action.payload.elementMetadata);
    
    const flatLeafElements: StructureElement[] = yield call(flattenDataTree, updatedMetadata);
    const totalLeafCount = flatLeafElements.length;
    const totalElementCodeQuantity = action.payload.elementsCodeData.reduce((acc, curr) => acc + Number(curr.totalQty), 0);;

    let calculatedElementCodeData: ClaculatedIFCElementCodeData[] = [];
    if (action.payload.elementMetadata.length > 0) {
        calculatedElementCodeData = getMetaDataFromIFCStructureElement(action.payload.elementMetadata);
    }

    yield put(setCurrentStructure({ 
        ...action.payload, 
        elementMetadata: updatedMetadata, 
        ifcCalculatedElementCodeData: calculatedElementCodeData ,
        totalIFCElementQuantity: totalLeafCount,
        totalElementCodeQuantity: totalElementCodeQuantity
    }));

    yield put(setPreviousInspectionData(action.payload.previousInspection || {} as InspectionEntity));

    if (action.payload.ifcfileaddress) {
        const hasLocalFile: boolean = yield call(hasIFCFile, action.payload.id);

        localStorage.setItem(`ifc_downloaded_${action.payload.id}`, hasLocalFile.toString());
    }
}

export function* getStructursData() {
    try {
        yield put(setShowLoading(true));

        yield put(fetchStructuresData());

        const isOnline: boolean = yield select(isOnlineSelector);

        if (isOnline) {
            const structureData: Structure[] = yield call(services.getStructureData);
            const now = new Date();

            const updatedList: Structure[] = structureData.map(item => {
                const nextInspectionDateStr = item.previousInspection?.nextInspectionProposedDate;

                if (!nextInspectionDateStr) {
                    item.urgency = StructureUrgencyEnum.Low;
                    return item;
                }

                const nextInspectionDate = new Date(nextInspectionDateStr);
                if (isNaN(nextInspectionDate.getTime()) || nextInspectionDateStr === defaultDateValue) {
                    // invalid date fallback
                    item.urgency = StructureUrgencyEnum.Low;
                    return item;
                }

                const diffMs = nextInspectionDate.getTime() - now.getTime();
                const diffDays = diffMs / (1000 * 60 * 60 * 24);

                if (diffDays < 0) {
                    item.urgency = StructureUrgencyEnum.Overdue;
                } else if (diffDays <= 7) {
                    item.urgency = StructureUrgencyEnum.High;
                } else if (diffDays <= 30) {
                    item.urgency = StructureUrgencyEnum.Medium;
                } else {
                    item.urgency = StructureUrgencyEnum.Low;
                }

                return item;
            });

            yield put(fetchStructuresDataSuccessful(updatedList));

            const stateToSave = {
                id: 'structureState', // fixed key
                structures: structureData,
            } as StructureState;

            yield call([db.structureState, db.structureState.put], stateToSave);
            console.log('Redux state saved to IndexedDB');
        } else {
            const savedStructureData: StructureState = yield call(() =>
                db.reduxApplicationState.get('structureState')
            );

            if (savedStructureData) {
                yield put(fetchStructuresDataSuccessful(savedStructureData.structures));
            } else {
                yield put(structuresDataFailed("No data found in local storage."));

                yield put(structuresDataFailed([]));
            }
        }
    }
    catch (error: any) {
        if (error instanceof Error) {
            yield put(structuresDataFailed(error.message));

        } else {
            yield put(structuresDataFailed(error));

        }
    } finally {
        yield put(setShowLoading(false));
    }
}

export function* setStructureDisplayModeSaga(action: PayloadAction<string>) {
    yield put(setStructureDisplayMode(action.payload));
}

