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

export function* structureRootSaga() {
    yield takeLatest(actions.SET_SLECTED_STRUCTURE_DATA, setCurrentStructureValue);

    yield takeLatest(actions.FETCH_STRUCTURES_DATA, getStructursData);
}

export function* setCurrentStructureValue(action: PayloadAction<Structure>) {
    yield put(commonActions.resetStateAction());

    const updatedMetadata = addQuantityToElements(action.payload.elementMetadata);

    yield put(setCurrentStructure({ ...action.payload, elementMetadata: updatedMetadata }));


}

export function* getStructursData() {
    try {
        yield put(setShowLoading(true));

        yield put(fetchStructuresData());

        const isOnline: boolean = yield select(isOnlineSelector);

        if (isOnline) {
            const structureData: Structure[] = yield call(services.getStructureData);

            yield put(fetchStructuresDataSuccessful(structureData));

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

