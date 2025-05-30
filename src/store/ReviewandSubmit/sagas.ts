import { takeLatest, select, call, put } from 'redux-saga/effects';
import * as actions from "./actions";
import { getCurrentStructure } from '../Structure/selectors';
import { ElementCodeData, Structure, StructureElement } from '../../entities/structure';
import { 
    ConditionRatingEntity, 
    InspectionEntity, 
    MaintenanceActionEntity, 
    MaintenanceImageFileEntity, 
    uploadAPIResponse 
} from '../../entities/inspection';
import * as inspectionServices from "../../services/inspectionService";
import { getInspection } from '../Inspection/selectors';
import { InspectionModel, MaintenanceActionModel } from '../../models/inspectionModel';
import { setInspectionPayload, setReviewAndSubmitResult, setReviewError } from './slice';
import { getMaintenanceActions } from '../MaintenanceAction/selectors';
import { getRatedElementCodeData, getRatedElements } from '../ConditionRating/selectors';
import { v4 as uuidv4 } from 'uuid';
import { getInspectionComment } from '../InspectionComment/selectors';
import { setShowLoading } from '../Common/slice';
import { removeStateFromLocalStorage } from '../LocalStorage/sagas';
import * as assetService from '../../services/assetManagementService';
import { CapturedImage, getImageById } from '../../helper/db';
import { PayloadAction } from '@reduxjs/toolkit';
import { SubmitDatapayload } from '../../models/submitDataModel';

export function* reviewAndSubmitRootSaga() {
    yield takeLatest(actions.SUBMIT_DATA, saveData);
}

export function* saveData(action: PayloadAction<SubmitDatapayload>) {
    try {
        yield put(setShowLoading(true));

        const selectedStructure: Structure = yield select(getCurrentStructure);
        const maintenanceActionsModel: MaintenanceActionModel[] = yield select(getMaintenanceActions);
        const maintenanceActionsEntity: MaintenanceActionEntity[] = [];

        for (const action of maintenanceActionsModel) {

            const photos: MaintenanceImageFileEntity[] = [];

            if (action.photos?.length > 0) {
                const path = `${selectedStructure.id}/${action.elementCode}`;

                for (const item of action.photos) {
                    const cachedImage: CapturedImage = yield call(getImageById, item.dbId);

                    const file = new File([cachedImage.blob], cachedImage.fileName, {
                        type: 'image/jpeg'
                    });

                    const response: uploadAPIResponse = yield call(assetService.uploadImage, file, path);

                    photos.push({
                        ...item,
                        apiResponse: response,
                    } as MaintenanceImageFileEntity);
                }
            }

            maintenanceActionsEntity.push({ ...action, photos: [...photos] } as MaintenanceActionEntity)
        }

        const ratedElements: StructureElement[] = yield select(getRatedElements);
        const ratedElementCodeData: ElementCodeData[] = yield select(getRatedElementCodeData);
        let conditionRatingEntity = [] as ConditionRatingEntity[];

        if(ratedElements?.length > 0) {
            conditionRatingEntity = ratedElements?.map(item => {
                return {
                    conditionRatingId: uuidv4(),
                    elementId: item.data.expressID.toString(),
                    elementCode: item.data.Name || "",
                    elementDescription: item.data.Name || "",
                    ratings: item.condition
                } as ConditionRatingEntity
            });
        } else if (ratedElementCodeData?.length > 0) {
            conditionRatingEntity = ratedElementCodeData?.map(item => {
                return {
                    conditionRatingId: uuidv4(),
                    elementId: item.id,
                    elementCode: item.elementCode || "",
                    elementDescription: item.description || "",
                    ratings: item.condition
                } as ConditionRatingEntity
            });
        }

        const inspectionComment: string = yield select(getInspectionComment)
        const currentInspection: InspectionModel = yield select(getInspection);
        const newInspection =
            {
                ...currentInspection,
                structureId: selectedStructure?.id,
                maintenanceActions: [...maintenanceActionsEntity],
                conditionRatings: [...conditionRatingEntity],
                ifcPopulatedConditionRatingData: action.payload.ifcPopulatedConditionRating,
                comment: inspectionComment
            } as InspectionEntity


        yield put(setInspectionPayload(newInspection));

        const inspectionId: string = yield call(inspectionServices.createInspectionlData, newInspection);

        yield put(setReviewAndSubmitResult(inspectionId));

        yield call(removeStateFromLocalStorage);

        if(action.payload.callback)
            yield call(action.payload.callback);
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
