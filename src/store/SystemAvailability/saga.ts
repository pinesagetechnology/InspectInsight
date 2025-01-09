import { call, put, takeLatest } from "redux-saga/effects";
import * as services from "../../services/systemAvailability";
import { setSystemAvailability } from "./slice";
import * as actions from "./actions";
import { SYSTEM_AVAILABILITY_KEY } from "../../constants";

export function* systemStatusWatcher() {
    yield takeLatest(actions.SYSTEM_CHECK_STATUS, checkStatusSaga);

    yield takeLatest(actions.SYSTEM_SET_STATUS, setStatusSaga);
}

function* checkStatusSaga() {
    try {
        const result: string = yield call(services.checkSystemAvailability);

        yield put(setSystemAvailability((result === SYSTEM_AVAILABILITY_KEY)));

        // if (isOnline) {
        //     yield call(processOfflineActions);
        // }
    } catch (error) {
        yield put(setSystemAvailability(false));
    }
}

function* setStatusSaga() {
    try {
        yield put(setSystemAvailability(false));
    } catch (error) {
        //yield put(setSystemAvailability(false));
    }
}
