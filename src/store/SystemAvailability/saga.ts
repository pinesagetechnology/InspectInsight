import { call, put, takeLatest } from "redux-saga/effects";
import * as services from "../../services/systemAvailability";
import { setSystemAvailability } from "./slice";
import * as actions from "./actions";
import { SYSTEM_AVAILABILITY_KEY } from "../../constants";

export function* systemStatusWatcher() {
    yield takeLatest(actions.SYSTEM_CHECK_STATUS, checkStatusSaga);

    yield takeLatest(actions.SYSTEM_SET_STATUS_OFFLINE, setStatusSaga);
}

function* checkStatusSaga() {
    try {
        const apiResult: string = yield call(services.checkSystemAvailability);
        const assetAPIResult: string = yield call(services.checkAssetAPIAvailability);

        yield put(setSystemAvailability((apiResult === SYSTEM_AVAILABILITY_KEY && assetAPIResult === SYSTEM_AVAILABILITY_KEY)));

    } catch (error) {
        yield put(setSystemAvailability(false));
    }
}

function* setStatusSaga() {
    yield put(setSystemAvailability(false));
}
