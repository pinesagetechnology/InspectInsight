import { takeLatest, put } from 'redux-saga/effects';
import * as actions from './actions';
import { setShowLoading } from './slice';

export function* sharedRootSaga() {
    yield takeLatest(actions.CLOSE_LOADING_OVERLAY, closeLoadingOverlay);
    yield takeLatest(actions.SHOW_LOADING_OVERLAY, showLoadingOverlay);
}

export function* closeLoadingOverlay() {
    yield put(setShowLoading(false));
}

export function* showLoadingOverlay() {
    yield put(setShowLoading(true));
}