import { all, fork } from "redux-saga/effects";
import { structureRootSaga } from "./Structure/sagas";
import { inspectionRootSaga } from "./Inspection/sagas";
import { conditionRatingRootSaga } from "./ConditionRating/sagas";
import { stepsRootSaga } from "./FormSteps/sagas";
import { maintenanceActionRootSaga } from "./MaintenanceAction/sagas";
import { inspectionCommentRootSaga } from "./InspectionComment/sagas";
import { sharedRootSaga } from "./Common/sagas";
import { systemStatusWatcher } from "./SystemAvailability/saga";
import { reviewAndSubmitRootSaga } from "./ReviewandSubmit/sagas";
import { locaStorageRootSaga } from "./LocalStorage/sagas";
import { ifcViewerRootSaga } from "./IFCViewer/sagas";
import { authRootSaga } from "./Auth/sagas";
import { systemDataWatcher } from "./SystemData/saga";

export default function* rootSaga() {
    yield all([
        fork(sharedRootSaga),
        fork(stepsRootSaga),
        fork(structureRootSaga),
        fork(inspectionRootSaga),
        fork(conditionRatingRootSaga),
        fork(maintenanceActionRootSaga),
        fork(inspectionCommentRootSaga),
        fork(systemStatusWatcher),
        fork(reviewAndSubmitRootSaga),
        fork(locaStorageRootSaga),
        fork(ifcViewerRootSaga),
        fork(authRootSaga),
        fork(systemDataWatcher)
    ]);
}
