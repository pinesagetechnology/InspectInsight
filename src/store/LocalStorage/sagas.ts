import { takeLatest, put, select, call } from 'redux-saga/effects';
import * as actions from "./actions";
import { getInspection, getPreviousInspectionList, selectedPreviousInspectionData } from '../Inspection/selectors';
import { InspectionModel, MaintenanceActionModel } from '../../models/inspectionModel';
import { getRatedElements } from '../ConditionRating/selectors';
import { getMaintenanceActions } from '../MaintenanceAction/selectors';
import { setLocalStorageFlag, setLocaStorageError } from './slice';
import { setCurrentInspection, setPreviousInspectionFromSavedState, setPreviousInspectionListFromSavedState } from '../Inspection/slice';
import { setReatedElement } from '../ConditionRating/slice';
import { setMaintenanceActionList } from '../MaintenanceAction/slice';
import { db, ReduxApplicationState } from '../../helper/db';
import { StructureElement } from '../../entities/structure';

export function* locaStorageRootSaga() {
    yield takeLatest(actions.SAVE_IN_LOCAL_STORAGE, saveStateInLocalStorage);
    yield takeLatest(actions.CHECK_LOCAL_STORAGE_EXIST, checkIfLocalStorageHasValue);
    yield takeLatest(actions.MAP_LOCAL_STORAGE_STATE, mapLocalStorageToState);
    yield takeLatest(actions.REMOVE_FROM_LOCAL_STORAGE, removeStateFromLocalStorage);
}

export function* saveStateInLocalStorage() {
    try {
        const inspectionState: InspectionModel = yield select(getInspection);
        const previousInspectionList: InspectionModel[] = yield select(getPreviousInspectionList);
        const previousInspection: InspectionModel = yield select(selectedPreviousInspectionData);
        const ratedElements: StructureElement[] = yield select(getRatedElements);
        const maintenanceActions: MaintenanceActionModel[] = yield select(getMaintenanceActions);

        const stateToSave = {
            id: 'appState', // fixed key
            inspectionData: {
                currentInspection: inspectionState,
                previoustInspection: previousInspection,
                previoustInspectionsList: previousInspectionList,
            },
            conditionRating: {
                ratedElements: ratedElements,
            },
            maintenanceAction: {
                maintenanceActions: maintenanceActions,
            },
        } as ReduxApplicationState;

        yield call([db.reduxApplicationState, db.reduxApplicationState.put], stateToSave);

        console.log('Redux state saved to IndexedDB');
    } catch (error: any) {
        console.error('Error saving state to IndexedDB:', error);

        if (error instanceof Error) {
            yield put(setLocaStorageError(error.message));

        } else {
            yield put(setLocaStorageError(error));

        }
    }
}

export function* mapLocalStorageToState() {
    try {
        // Get the saved state from Dexie using the fixed key
        const savedState: ReduxApplicationState = yield call(() =>
            db.reduxApplicationState.get('reduxState')
        );
        console.log("savedState", savedState);

        if (savedState) {
            // mapp inspection
            yield put(setCurrentInspection(savedState.inspectionData.currentInspection));
            yield put(setPreviousInspectionFromSavedState(savedState.inspectionData.previoustInspection));
            yield put(setPreviousInspectionListFromSavedState(savedState.inspectionData.previoustInspectionsList));

            // mapp condition rating
            yield put(setReatedElement(savedState.conditionRating.ratedElements));

            // mapp maintenance action
            yield put(setMaintenanceActionList(savedState.maintenanceAction.maintenanceActions));

        } else {
            console.log('No state found in IndexedDB');
        }
    } catch (error) {
        console.error('Error loading state from IndexedDB:', error);
    }
}

export function* checkIfLocalStorageHasValue() {
    try {
        const exists: number = yield db.reduxApplicationState.count();

        yield put(setLocalStorageFlag(exists > 0));
    } catch (error: any) {
        if (error instanceof Error) {
            yield put(setLocaStorageError(error.message));

        } else {
            yield put(setLocaStorageError(error));

        }
    }
}

export function* removeStateFromLocalStorage() {
    try {
        yield db.reduxApplicationState.clear();
        console.log('All data cleared from IndexedDB');
    } catch (error) {
        if (error instanceof Error) {
            yield put(setLocaStorageError(error.message));
        } else {
            yield put(setLocaStorageError(error));
        }
    }
}

