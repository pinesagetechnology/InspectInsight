import { takeLatest, put, select, call } from 'redux-saga/effects';
import * as actions from "./actions";
import { PayloadAction } from '@reduxjs/toolkit';
import {
    setMaintenanceActionList,
    setMaintenanceAcctionError,
    setCurrentMaintenanceFormData,
    setUploadFlag
} from './slice';
import { DeleteImagePayload, MaintenanceActionModel, MaintenanceImageFile, UploadAPIResponse } from '../../models/inspectionModel';
import { getMaintenanceActions, getMaintenanceFormData } from './selectors';
import { v4 as uuidv4 } from 'uuid';
import { Structure, StructureElement } from '../../entities/structure';
import * as service from "../../services/assetManagementService";
import { getCurrentStructure } from '../Structure/selectors';

export function* maintenanceActionRootSaga() {
    yield takeLatest(actions.ADD_MAINTENANCE_ACTION_DATA, addMaintenanceActionValue);
    yield takeLatest(actions.UPDATE_MAINTENANCE_ACTION_DATA, updateMaintenanceActionValue);
    yield takeLatest(actions.DELETE_MAINTENANCE_ACTION_DATA, deleteMaintenanceActionValue);
    yield takeLatest(actions.ADD_NEW_ITEM, addNewItem);
    yield takeLatest(actions.CANCEL_NEW_ITEM, cancelNewItem);
    yield takeLatest(actions.EDIT_ITEM, editItem);
    yield takeLatest(actions.SET_MAINTENANCE_FORM_DATA, setMaintenanceActionFormData);
    yield takeLatest(actions.UPLOAD_MAINTENANCE_IMAGE, uploadMaintenanceImageData);
    yield takeLatest(actions.DELETE_MAINTENANCE_IMAGE, deleteMaintenanceImageData);
    yield takeLatest(actions.SET_SELECTED_MAINTENANCE_ITEM, setSelectedMaintenanceItem);
}

export function* addNewItem(action: PayloadAction<StructureElement>) {
    const maintenancActions: MaintenanceActionModel[] = yield select(getMaintenanceActions);

    const newMaintenanceAction = {
        id: "-1",
        isSectionExpanded: true,
        dateForCompletion: new Date().toISOString(),
        elementCode: action.payload.properties?.Tag?.value || action.payload.data.Entity,
        elementId: action.payload.data.expressID,
        mode: 1
    } as MaintenanceActionModel;

    yield put(setMaintenanceActionList([
        newMaintenanceAction,
        ...(maintenancActions || [])]
    ));

    yield put(setCurrentMaintenanceFormData(newMaintenanceAction));
}

export function* cancelNewItem() {
    const maintenancActions: MaintenanceActionModel[] = yield select(getMaintenanceActions);

    const updatedList = (maintenancActions?.filter(item => item.id !== "-1") || [])
        .map(item => {
            return { ...item, isSectionExpanded: false, mode: 0 };
        });

    yield put(setMaintenanceActionList(updatedList || []));

    yield put(setCurrentMaintenanceFormData(
        {} as MaintenanceActionModel
    ));
}

export function* editItem(action: PayloadAction<string>) {
    const maintenancActions: MaintenanceActionModel[] = yield select(getMaintenanceActions);

    const selectedIndex = maintenancActions?.findIndex(x => x.id === action.payload);

    if (selectedIndex > -1 && maintenancActions[selectedIndex])
        yield put(setCurrentMaintenanceFormData({
            ...maintenancActions[selectedIndex],
            mode: 2,
            isSectionExpanded: true
        }));

    const updatedList = maintenancActions?.map(item => {
        if (item.id === action.payload)
            return { ...item, isSectionExpanded: true, mode: 2 };
        else
            return { ...item, isSectionExpanded: false, mode: 0 };
    });

    yield put(setMaintenanceActionList(updatedList || []));

}

export function* addMaintenanceActionValue(action: PayloadAction<MaintenanceActionModel>) {
    const maintenancActions: MaintenanceActionModel[] = yield select(getMaintenanceActions);

    const newMaintenanceActionItem = {
        ...action.payload,
        id: uuidv4(),
        isSectionExpanded: false,
        mode: 0
    };

    const updatedList = maintenancActions?.map(item => {
        if (item.id === "-1")
            return newMaintenanceActionItem;
        else
            return item;
    })

    yield put(setCurrentMaintenanceFormData(newMaintenanceActionItem));

    yield put(setMaintenanceActionList(updatedList));
}

export function* updateMaintenanceActionValue(action: PayloadAction<MaintenanceActionModel>) {
    const maintenancActions: MaintenanceActionModel[] = yield select(getMaintenanceActions);

    const updatedMaintenanceActionItem = {
        ...action.payload,
        isSectionExpanded: false,
        mode: 0
    };

    const updatedList = maintenancActions?.map(item => {
        if (item.id === action.payload.id)
            return updatedMaintenanceActionItem;
        else
            return item;
    })

    yield put(setCurrentMaintenanceFormData(updatedMaintenanceActionItem));

    yield put(setMaintenanceActionList([...(updatedList || [])]));
}

export function* deleteMaintenanceActionValue(action: PayloadAction<string>) {
    const maintenancActions: MaintenanceActionModel[] = yield select(getMaintenanceActions);

    const updatedList = maintenancActions?.filter(item => item.id !== action.payload);

    yield put(setCurrentMaintenanceFormData(
        {} as MaintenanceActionModel
    ));

    yield put(setMaintenanceActionList([...(updatedList || [])]));
}

export function* setMaintenanceActionFormData(action: PayloadAction<MaintenanceActionModel>) {
    yield put(setCurrentMaintenanceFormData(action.payload));
}

export function* uploadMaintenanceImageData(action: PayloadAction<MaintenanceActionModel>) {
    try {
        yield put(setUploadFlag(true));

        const selectedStructure: Structure = yield select(getCurrentStructure);
        const path = `${selectedStructure.id}/${action.payload.elementCode}`;

        const updatedPayloadPhotos = [] as MaintenanceImageFile[];
        for (const photo of action.payload.photos) {
            if (photo.uploadAPIResponse === undefined) {
                const response: UploadAPIResponse = yield call(service.uploadImage, photo, path);
                updatedPayloadPhotos.push({ ...photo, file: undefined, uploadAPIResponse: response });
            } else {
                updatedPayloadPhotos.push({ ...photo, file: undefined });
            }
        }

        yield put(setCurrentMaintenanceFormData({ ...action.payload, photos: updatedPayloadPhotos }));

    } catch (error: any) {
        if (error instanceof Error) {
            yield put(setMaintenanceAcctionError(error.message));
        } else {
            yield put(setMaintenanceAcctionError(error));

        }
    }
    finally {
        yield put(setUploadFlag(false));
    }
}

export function* deleteMaintenanceImageData(action: PayloadAction<DeleteImagePayload>) {
    try {
        yield put(setUploadFlag(true));

        yield call(service.deleteImage, action.payload.id);

        const currentMaintenanceData: MaintenanceActionModel = yield select(getMaintenanceFormData);

        yield put(setCurrentMaintenanceFormData({ ...currentMaintenanceData, photos: action.payload.updatedImageList }));

    } catch (error: any) {
        if (error instanceof Error) {
            yield put(setMaintenanceAcctionError(error.message));
        } else {
            yield put(setMaintenanceAcctionError(error));

        }
    }
    finally {
        yield put(setUploadFlag(false));
    }
}

export function* setSelectedMaintenanceItem(action: PayloadAction<string>) {
    const maintenancActions: MaintenanceActionModel[] = yield select(getMaintenanceActions);

    const selectedIndex = maintenancActions?.findIndex(x => x.id === action.payload);

    if (selectedIndex > -1 && maintenancActions[selectedIndex])
        yield put(setCurrentMaintenanceFormData({
            ...maintenancActions[selectedIndex],
            mode: 0,
            isSectionExpanded: (!maintenancActions[selectedIndex].isSectionExpanded)
        }));

    const updatedList = maintenancActions?.map(item => {
        if (item.id === action.payload)
            return {
                ...item,
                isSectionExpanded: (!item.isSectionExpanded),
                mode: 0
            };
        else
            return { ...item, isSectionExpanded: false, mode: 0 };
    });

    yield put(setMaintenanceActionList(updatedList || []));
}