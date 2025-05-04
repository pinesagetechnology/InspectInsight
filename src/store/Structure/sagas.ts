import { takeLatest, call, put, select } from 'redux-saga/effects';
import * as actions from "./actions";
import { PayloadAction } from '@reduxjs/toolkit';
import { Structure } from '../../entities/structure';
import {
    fetchStructuresData,
    setCurrentStructure,
    structuresDataFailed,
    fetchStructuresDataSuccessful,
} from './slice';
import * as services from "../../services/structureService";
import { setShowLoading } from '../Common/slice';
import * as commonActions from '../Common/actions';
import { addQuantityToElements } from '../../helper/ifcTreeManager';
import { isOnlineSelector } from '../SystemAvailability/selectors';
import { db, StructureState } from '../../helper/db';
import { setPreviousInspectionData } from '../Inspection/slice';
import { InspectionEntity } from '../../entities/inspection';
import { addDays } from '../../helper/util';
import { StructureUrgencyEnum } from '../../enums';

export function* structureRootSaga() {
    yield takeLatest(actions.SET_SLECTED_STRUCTURE_DATA, setCurrentStructureValue);

    yield takeLatest(actions.FETCH_STRUCTURES_DATA, getStructursData);
}

export function* setCurrentStructureValue(action: PayloadAction<Structure>) {
    yield put(commonActions.resetStateAction());

    const updatedMetadata = addQuantityToElements(action.payload.elementMetadata);

    yield put(setCurrentStructure({ ...action.payload, elementMetadata: updatedMetadata }));

    yield put(setPreviousInspectionData(action.payload.previousInspection || {} as InspectionEntity));
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
                const normalCase = addDays(now, 31);
                const nextMonth = addDays(now, 30);

                const lastInspectionDate = new Date(item.lastInspectionDate);
                console.log("lastInspectionDate", lastInspectionDate, "now", now)
                if (lastInspectionDate < normalCase) {
                    item.urgency = StructureUrgencyEnum.Low
                } else if (lastInspectionDate > now && lastInspectionDate <= nextMonth) {
                    item.urgency = StructureUrgencyEnum.Medium
                } else {
                    item.urgency = StructureUrgencyEnum.High
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

