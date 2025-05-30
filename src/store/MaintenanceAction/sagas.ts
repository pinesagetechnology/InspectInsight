import { takeLatest, put, select, call } from 'redux-saga/effects';
import * as actions from "./actions";
import { PayloadAction } from '@reduxjs/toolkit';
import {
    setMaintenanceActionList,
    setMaintenanceAcctionError,
    setCurrentMaintenanceFormData,
    setUploadFlag,
    setMaintenanceValidationErrors,
    setMaintenanceActionModalFlag
} from './slice';
import { DeleteImagePayload, MaintenanceActionModel, MaintenanceImageFile } from '../../models/inspectionModel';
import { getMaintenanceActions, getMaintenanceFormData } from './selectors';
import { v4 as uuidv4 } from 'uuid';

export function* maintenanceActionRootSaga() {
    yield takeLatest(actions.ADD_MAINTENANCE_ACTION_DATA, addMaintenanceActionValue);
    yield takeLatest(actions.UPDATE_MAINTENANCE_ACTION_DATA, updateMaintenanceActionValue);
    yield takeLatest(actions.DELETE_MAINTENANCE_ACTION_DATA, deleteMaintenanceActionValue);
    yield takeLatest(actions.ADD_NEW_ITEM, addNewItem);
    yield takeLatest(actions.CANCEL_NEW_ITEM, cancelNewItem);
    yield takeLatest(actions.EDIT_ITEM, editItem);
    yield takeLatest(actions.SET_MAINTENANCE_FORM_DATA, setMaintenanceActionFormData);
    yield takeLatest(actions.SAVE_MAINTENANCE_IMAGE, saveMaintenanceImageData);
    yield takeLatest(actions.DELETE_MAINTENANCE_IMAGE, deleteMaintenanceImageData);
    yield takeLatest(actions.SET_SELECTED_MAINTENANCE_ITEM, setSelectedMaintenanceItem);
    yield takeLatest(actions.SET_MAINTENANCE_VALIDATION, validateMaintenanceForm);
    yield takeLatest(actions.SET_MAINTENANCE_ACTION_MODAL_FLAG, setMaintenanceActionModalFlagSaga);
}

export function* addNewItem(action: PayloadAction<MaintenanceActionModel>) {
    const maintenancActions: MaintenanceActionModel[] = yield select(getMaintenanceActions);
    yield put(setMaintenanceActionList([
        action.payload,
        ...(maintenancActions || [])]
    ));

    yield put(setCurrentMaintenanceFormData(action.payload));

    yield put(setMaintenanceActionModalFlag(true));
}

export function* setMaintenanceActionModalFlagSaga(action: PayloadAction<boolean>) {
    if (action.payload === false) {
        const maintenancActions: MaintenanceActionModel[] = yield select(getMaintenanceActions);
        const updatedList = maintenancActions?.filter(item => item.id !== "-1");
        yield put(setMaintenanceActionList([
            ...(updatedList || [])]
        ));
    }

    yield put(setMaintenanceActionModalFlag(action.payload));

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
    const isValid: boolean = yield call(validateMaintenanceForm, action);
    if (!isValid) {
        return;
    }

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
    const isValid: boolean = yield call(validateMaintenanceForm, action);
    if (!isValid) {
        return;
    }

    yield call(UpdateMaintenanceActionItem, action.payload, false);
}

function* UpdateMaintenanceActionItem(item: MaintenanceActionModel, isSectionExpanded: boolean) {
    const maintenancActions: MaintenanceActionModel[] = yield select(getMaintenanceActions);

    const updatedMaintenanceActionItem = {
        ...item,
        isSectionExpanded: isSectionExpanded,
        mode: 0
    };

    const updatedList = maintenancActions?.map(mAction => {
        if (mAction.id === item.id)
            return updatedMaintenanceActionItem;
        else
            return mAction;
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

export function* saveMaintenanceImageData(action: PayloadAction<MaintenanceActionModel>) {
    try {
        yield put(setUploadFlag(true));

        const updatedPayloadPhotos = [] as MaintenanceImageFile[];
        for (const photo of action.payload.photos) {
            updatedPayloadPhotos.push({ ...photo });
        }

        yield put(setCurrentMaintenanceFormData({ ...action.payload, photos: updatedPayloadPhotos }));

        if(action.payload.id !== "-1") {
            yield call(UpdateMaintenanceActionItem, { ...action.payload, photos: updatedPayloadPhotos }, true);
        }
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

export function* validateMaintenanceForm(action: PayloadAction<MaintenanceActionModel>) {
    const formData = action.payload;
    const validationErrors: string[] = [];

    // Required fields validation
    if (!formData.inspectionComment?.trim()) {
        validationErrors.push('inspectionComment');
    }
    if (!formData.units?.trim()) {
        validationErrors.push('units');
    }
    if (!formData.probability?.trim()) {
        validationErrors.push('probability');
    }
    if (!formData.consequenceOfInteraction?.trim()) {
        validationErrors.push('consequenceOfInteraction');
    }
    if (!formData.activityInactionRisk?.trim()) {
        validationErrors.push('activityInactionRisk');
    }

    yield put(setMaintenanceValidationErrors(validationErrors));
    return validationErrors.length === 0;
}