import { takeLatest, call, put } from 'redux-saga/effects';
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

export function* structureRootSaga() {
    yield takeLatest(actions.SET_SLECTED_STRUCTURE_DATA, setCurrentStructureValue);

    yield takeLatest(actions.FETCH_STRUCTURES_DATA, getStructursData);
}

export function* setCurrentStructureValue(action: PayloadAction<Structure>) {
    yield put(commonActions.resetStateAction());

    yield put(setCurrentStructure(action.payload));
}

export function* getStructursData() {
    try {
        yield put(setShowLoading(true));

        yield put(fetchStructuresData());

        const structureData: Structure[] = yield call(services.getStructureData);

        yield put(fetchStructuresDataSuccessful(structureData));

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
