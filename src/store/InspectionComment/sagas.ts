import { takeLatest, put, select, call } from 'redux-saga/effects';
import * as actions from "./actions";
import { PayloadAction } from '@reduxjs/toolkit';
import { setInspectionComment, setInspectionCommentError, setValidationErrorFlag } from './slice';
import { InspectionModel, MaintenanceActionModel } from '../../models/inspectionModel';
import { ConditionRatingEntity, InspectionEntity } from '../../entities/inspection';
import { getInspection } from '../Inspection/selectors';
import { getMaintenanceAction } from '../MaintenanceAction/selectors';
import { getConditionRating } from '../ConditionRating/selectors';
import { getInspectionComment } from './selectors';
import * as services from "../../services/inspectionService";

export function* inspectionCommentRootSaga() {
    yield takeLatest(actions.SET_INSPECTION_COMMENT_DATA, setInspectionCommentValue);
}

export function* setInspectionCommentValue(action: PayloadAction<string>) {
    if (!action.payload || !action.payload.trim()) {
        yield put(setValidationErrorFlag(true));
    } else {
        yield put(setValidationErrorFlag(false));
    }
    yield put(setInspectionComment(action.payload));

}

function* saveInspectionCommentData() {
    try {
        const inspectionData: InspectionModel = yield select(getInspection);
        const maintenanceActions: MaintenanceActionModel[] = yield select(getMaintenanceAction);
        const conditionRatings: ConditionRatingEntity[] = yield select(getConditionRating);
        const inspectionComment: string = yield select(getInspectionComment);

        const newInspectionEntity = {
            ...inspectionData,
            maintenanceActions: [...maintenanceActions],
            conditionRatings: conditionRatings,
            comment: inspectionComment
        } as InspectionEntity;

        yield call(services.updateInspectionlData, newInspectionEntity);
    }
    catch (error: any) {
        if (error instanceof Error) {
            yield put(setInspectionCommentError(error.message));

        } else {
            yield put(setInspectionCommentError(error));

        }
    }
}
