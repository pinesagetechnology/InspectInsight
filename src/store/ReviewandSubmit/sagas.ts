import { takeLatest, select, call, put } from 'redux-saga/effects';
import * as actions from "./actions";
import { getCurrentStructure } from '../Structure/selectors';
import { Structure, StructureElement } from '../../entities/structure';
import { ConditionRatingEntity, InspectionEntity, MaintenanceActionEntity } from '../../entities/inspection';
import * as inspectionServices from "../../services/inspectionService";
import { getInspection } from '../Inspection/selectors';
import { InspectionModel, MaintenanceActionModel } from '../../models/inspectionModel';
import { setInspectionPayload, setReviewAndSubmitResult, setReviewError } from './slice';
import { getMaintenanceAction } from '../MaintenanceAction/selectors';
import { getRatedElements } from '../ConditionRating/selectors';
import { v4 as uuidv4 } from 'uuid';
import { getInspectionComment } from '../InspectionComment/selectors';
import { setShowLoading } from '../Common/slice';
import { removeStateFromLocalStorage } from '../LocalStorage/sagas';

export function* reviewAndSubmitRootSaga() {
    yield takeLatest(actions.SUBMIT_DATA, saveData);
}

export function* saveData() {
    try {
        yield put(setShowLoading(true));

        const selectedStructure: Structure = yield select(getCurrentStructure);
        const maintenanceActionsModel: MaintenanceActionModel[] = yield select(getMaintenanceAction);
        const maintenanceActionsEntity = maintenanceActionsModel?.map(action => {
            return {
                ...action,
            } as MaintenanceActionEntity
        });

        const ratedElements: StructureElement[] = yield select(getRatedElements);
        const conditionRatingEntity = ratedElements?.map(item => {
            return {
                conditionRatingId: uuidv4(),
                elementId: item.elementId,
                ratings: item.condition
            } as ConditionRatingEntity
        });

        const inspectionComment: string = yield select(getInspectionComment)
        const currentInspection: InspectionModel = yield select(getInspection);
        const newInspection =
            {
                ...currentInspection,
                structureId: selectedStructure?.id,
                maintenanceActions: [...maintenanceActionsEntity],
                conditionRatings: [...conditionRatingEntity],
                comment: inspectionComment
            } as InspectionEntity


        yield put(setInspectionPayload(newInspection));

        const inspectionId: string = yield call(inspectionServices.createInspectionlData, newInspection);

        yield put(setReviewAndSubmitResult(inspectionId));

        yield call(removeStateFromLocalStorage);
    }
    catch (error: any) {
        if (error instanceof Error) {
            yield put(setReviewError(error.message));

        } else {
            yield put(setReviewError(error));

        }
    }
    finally {
        yield put(setShowLoading(false));
    }
}
