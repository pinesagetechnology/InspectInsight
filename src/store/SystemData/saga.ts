import { call, put, takeLatest } from "redux-saga/effects";
import * as servicesMMSActivity from "../../services/MMSData";
import * as servicesElementsCode from "../../services/elementCodeData";
import * as actions from "./actions";
import { setBaseDataError, setElementsCodeListData, setElementsCodes, setMMSActivities, setMMSActivityListData } from "./slice";
import { MenuItemModel } from "../../models/menuItemModel";
import { ElementCodeData } from "entities/structure";
import { MMSActivity } from "../../entities/systemData";

export function* systemDataWatcher() {
    yield takeLatest(actions.GET_SYSTEM_DATA, getSystemBaseDataSaga);

    yield takeLatest(actions.GET_ELEMENTS_CODE_DATA, getElementsCodeDataSaga);
}

function* getSystemBaseDataSaga() {
    try {
        const mmsActivityList: MMSActivity[] = yield call(servicesMMSActivity.fetchMMSActivityData);

        const mmsActivities: MenuItemModel[] = [];

        mmsActivityList?.forEach((item) => {
            mmsActivities.push({
                text: `${item.code} - ${item.description}`,
                value: `${item.code}`
            })
        })

        yield put(setMMSActivities(mmsActivities));

        yield put(setMMSActivityListData(mmsActivityList));

    } catch (error) {
        if (error instanceof Error) {
            yield put(setBaseDataError(error.message));
        } else {
            yield put(setBaseDataError(error));
        }
    }
}

function* getElementsCodeDataSaga() {
    try {
        const elementCodeListData: ElementCodeData[] = yield call(servicesElementsCode.fetchElementsCodeData);

        const elementCodeItems: MenuItemModel[] = [];

        elementCodeListData?.forEach((item) => {
            elementCodeItems.push({
                text: `${item.elementCode} - ${item.description}`,
                value: `${item.elementCode}`
            })
        })

        yield put(setElementsCodes(elementCodeItems));

        yield put(setElementsCodeListData(elementCodeListData));

    } catch (error) {
        if (error instanceof Error) {
            yield put(setBaseDataError(error.message));
        } else {
            yield put(setBaseDataError(error));
        }
    }
}
