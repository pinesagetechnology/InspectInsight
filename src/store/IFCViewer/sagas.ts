import { takeLatest, put, select } from 'redux-saga/effects';
import * as actions from "./actions";
import { PayloadAction } from '@reduxjs/toolkit';
import { getVisibilityOffIcons } from './selectors';
import { setVisibilityIconOffValue } from './slice';

export function* ifcViewerRootSaga() {
    yield takeLatest(actions.ADD_VISIBILITY_ICON, addVisibilityOffIcon);
    yield takeLatest(actions.REMOVE_VISIBILITY_ICON, removeVisibilityOffIcon);
}

export function* addVisibilityOffIcon(action: PayloadAction<string>) {
    if (!action.payload) return;

    const visibilityIcons: string[] = yield select(getVisibilityOffIcons);

    if (!visibilityIcons.includes(action.payload)) {
        const updatedVisibilityIcons = [...visibilityIcons, action.payload];

        yield put(setVisibilityIconOffValue(updatedVisibilityIcons));
    }
}

export function* removeVisibilityOffIcon(action: PayloadAction<string>) {
    if (!action.payload) return;

    const visibilityIcons: string[] = yield select(getVisibilityOffIcons);

    const updatedVisibilityIcons = visibilityIcons.filter((icon) => icon !== action.payload);

    yield put(setVisibilityIconOffValue(updatedVisibilityIcons));
}
