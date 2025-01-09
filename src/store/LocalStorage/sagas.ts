import { takeLatest, put, select, call } from 'redux-saga/effects';
import * as actions from "./actions";
import { BrowserStorageKey } from '../../enums';
import { getAllInspectionState } from '../Inspection/selectors';
import { InspectionModel } from '../../models/inspectionModel';
import * as utils from '../../helper/util';
import { getAllConditionRatingState } from '../ConditionRating/selectors';
import { getAllMaintenanceActionState } from '../MaintenanceAction/selectors';
import { getAllInspectionCommentState } from '../InspectionComment/selectors';
import {
    setLocalStorageFlag,
    setLocaStorageError,
} from './slice';
import { setInspectionStateFromStorage } from '../Inspection/slice';
import { setConditionRatingStateFromStorage } from '../ConditionRating/slice';
import { setMaintenanceActionStateFromStorage } from '../MaintenanceAction/slice';
import { setInspectionCommentStateFromStorage } from '../InspectionComment/slice';

export function* locaStorageRootSaga() {
    yield takeLatest(actions.SAVE_IN_LOCAL_STORAGE, saveStateInLocalStorage);
    yield takeLatest(actions.CHECK_LOCAL_STORAGE_EXIST, checkIfLocalStorageHasValue);
    yield takeLatest(actions.MAP_LOCAL_STORAGE_STATE, mapLocalStorageToState);
    yield takeLatest(actions.REMOVE_FROM_LOCAL_STORAGE, removeStateFromLocalStorage);
}

export function* saveStateInLocalStorage() {
    try {
        const inspectionState: InspectionModel = yield select(getAllInspectionState);
        yield call(utils.saveToStorage, BrowserStorageKey.InspectionDetail, inspectionState);

        const allConditionRating: InspectionModel = yield select(getAllConditionRatingState);
        yield call(utils.saveToStorage, BrowserStorageKey.ConditionRating, allConditionRating);

        const allMaintenanceAction: InspectionModel = yield select(getAllMaintenanceActionState);
        yield call(utils.saveToStorage, BrowserStorageKey.MaintenanceAction, allMaintenanceAction);

        const allInspectionCommentState: InspectionModel = yield select(getAllInspectionCommentState);
        yield call(utils.saveToStorage, BrowserStorageKey.InspectionComment, allInspectionCommentState);
    } catch (error: any) {
        if (error instanceof Error) {
            yield put(setLocaStorageError(error.message));

        } else {
            yield put(setLocaStorageError(error));

        }
    }
}

export function* checkIfLocalStorageHasValue() {
    try {
        let flag: boolean = false;

        const storageKeys = [
            BrowserStorageKey.InspectionDetail,
            BrowserStorageKey.ConditionRating,
            BrowserStorageKey.MaintenanceAction,
            BrowserStorageKey.InspectionComment,
        ];

        storageKeys.forEach((item => {
            const data = localStorage.getItem(item);
            if (data) {
                flag = true;
            }
        }));

        yield put(setLocalStorageFlag(flag));
    } catch (error: any) {
        if (error instanceof Error) {
            yield put(setLocaStorageError(error.message));

        } else {
            yield put(setLocaStorageError(error));

        }
    }
}

export function* mapLocalStorageToState() {
    try {
        const storageKeys = [
            BrowserStorageKey.InspectionDetail,
            BrowserStorageKey.ConditionRating,
            BrowserStorageKey.MaintenanceAction,
            BrowserStorageKey.InspectionComment,
        ];

        for (const key of storageKeys) {
            const data = localStorage.getItem(key);
            if (data) {
                switch (key) {
                    case BrowserStorageKey.InspectionDetail:
                        yield put(setInspectionStateFromStorage(JSON.parse(data)));
                        break;
                    case BrowserStorageKey.ConditionRating:
                        yield put(setConditionRatingStateFromStorage(JSON.parse(data)))
                        break;
                    case BrowserStorageKey.MaintenanceAction:
                        yield put(setMaintenanceActionStateFromStorage(JSON.parse(data)))
                        break;
                    case BrowserStorageKey.InspectionComment:
                        yield put(setInspectionCommentStateFromStorage(JSON.parse(data)))
                        break;
                    default:
                        break;
                }
            }
        }
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
        yield call(utils.removeToStorage, BrowserStorageKey.InspectionDetail);
        yield call(utils.removeToStorage, BrowserStorageKey.ConditionRating);
        yield call(utils.removeToStorage, BrowserStorageKey.MaintenanceAction);
        yield call(utils.removeToStorage, BrowserStorageKey.InspectionComment);
    } catch (error: any) {
        if (error instanceof Error) {
            yield put(setLocaStorageError(error.message));

        } else {
            yield put(setLocaStorageError(error));

        }
    }
}