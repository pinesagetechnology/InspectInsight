import { call, put, takeLatest } from "redux-saga/effects";
import * as services from "../../services/systyemBaseData";
import * as actions from "./actions";
import { setMMSActivities, setMMSActivityData, setMMSActivityDataError } from "./slice";
import { MMSActivity } from "../../entities/systemData";
import { MenuItemModel } from "../../models/menuItemModel";

export function* systemDataWatcher() {
    yield takeLatest(actions.GET_SYSTEM_DATA, getSystemBaseDataSaga);
}

function* getSystemBaseDataSaga() {
    try {
        const mmsActivityList: MMSActivity[] = yield call(services.fetchMMSActivityData);

        const mmsActivities: MenuItemModel[] = [];

        mmsActivityList?.forEach((item) => {
            mmsActivities.push({
                text: `${item.code}`,
                value: `${item.code}`
            })
        })

        yield put(setMMSActivities(mmsActivities));

        yield put(setMMSActivityData(mmsActivityList));

    } catch (error) {
        if (error instanceof Error) {
            yield put(setMMSActivityDataError(error.message));
        } else {
            yield put(setMMSActivityDataError(error));
        }
    }
}

