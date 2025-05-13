import { takeLatest, put, select, call } from 'redux-saga/effects';
import * as actions from "./actions";
import { getInspection, getPreviousInspectionList, selectedPreviousInspectionData } from '../Inspection/selectors';
import { InspectionModel, MaintenanceActionModel } from '../../models/inspectionModel';
import { getOriginalConditionRating, getDisplayElementList, getElementCodeDataList, getRatedElementCodeData, getRatedElements } from '../ConditionRating/selectors';
import { getMaintenanceActions } from '../MaintenanceAction/selectors';
import { setLocalStorageFlag, setLocaStorageError } from './slice';
import { setCurrentInspection, setPreviousInspectionData, setPreviousInspectionListFromSavedState } from '../Inspection/slice';
import { setDisplayConditionRatingElements, setOriginalConditionRating, setOriginalElementCodeDataList, setReatedElement, setReatedElementCode } from '../ConditionRating/slice';
import { setMaintenanceActionList } from '../MaintenanceAction/slice';
import { db, ReduxApplicationState, ensureDbReady } from '../../helper/db';
import { ElementCodeData, Structure, StructureElement } from '../../entities/structure';
import { getInspectionComment } from '../InspectionComment/selectors';
import { setInspectionComment } from '../InspectionComment/slice';
import { setShowLoading } from '../Common/slice';
import { getCurrentStructure } from '../Structure/selectors';
import { setCurrentStructure } from '../Structure/slice';

export function* locaStorageRootSaga() {
    yield takeLatest(actions.SAVE_IN_LOCAL_STORAGE, saveStateInLocalStorage);
    yield takeLatest(actions.CHECK_LOCAL_STORAGE_EXIST, checkIfLocalStorageHasValue);
    yield takeLatest(actions.MAP_LOCAL_STORAGE_STATE, mapLocalStorageToState);
    yield takeLatest(actions.REMOVE_FROM_LOCAL_STORAGE, removeStateFromLocalStorage);
}

export function* saveStateInLocalStorage() {
    try {
        yield put(setShowLoading(true));

        // Ensure database is ready
        yield call(ensureDbReady);

        const currentStructure: Structure = yield select(getCurrentStructure);

        const inspectionState: InspectionModel = yield select(getInspection);
        const previousInspectionList: InspectionModel[] = yield select(getPreviousInspectionList);
        const previousInspection: InspectionModel = yield select(selectedPreviousInspectionData);
        const ratedElements: StructureElement[] = yield select(getRatedElements);
        const originalConditionRatingList: StructureElement[] = yield select(getOriginalConditionRating);
        const displayElementList: StructureElement[] = yield select(getDisplayElementList);
        const maintenanceActions: MaintenanceActionModel[] = yield select(getMaintenanceActions);
        const inspectionComment: string = yield select(getInspectionComment);

        const ratedElementCodeData: ElementCodeData[] = yield select(getRatedElementCodeData);
        const elementCodeDataList: ElementCodeData[] = yield select(getElementCodeDataList);

        const stateToSave = {
            id: 'appState', // fixed key
            currentStructure: currentStructure,
            inspectionData: {
                currentInspection: inspectionState,
                previoustInspection: previousInspection,
                previoustInspectionsList: previousInspectionList,
            },
            conditionRating: {
                ratedElements: ratedElements,
                originalConditionRating: originalConditionRatingList,
                displayConditionRatingElements: displayElementList,
                ratedElementCodeData: ratedElementCodeData,
                elementCodeDataList: elementCodeDataList,
            },
            maintenanceAction: {
                maintenanceActions: maintenanceActions,
            },
            inspectionComment: inspectionComment,
            timestamp: Date.now(), // Add timestamp for versioning
        } as ReduxApplicationState;

        // Use your original method that works
        yield call([db.reduxApplicationState, db.reduxApplicationState.put], stateToSave);

        console.log('Redux state saved to IndexedDB');
    } catch (error: any) {
        console.error('Error saving state to IndexedDB:', error);

        // Implement retry logic here without using safePut
        let retryCount = 3;
        let saved = false;

        while (retryCount > 0 && !saved) {
            try {
                console.log(`Retrying save operation (${retryCount} attempts left)...`);
                // Wait a bit before retrying
                yield call(delay, 500);

                // Get fresh state
                const currentStructure: Structure = yield select(getCurrentStructure);

                const inspectionState: InspectionModel = yield select(getInspection);
                const previousInspectionList: InspectionModel[] = yield select(getPreviousInspectionList);
                const previousInspection: InspectionModel = yield select(selectedPreviousInspectionData);
                const ratedElements: StructureElement[] = yield select(getRatedElements);
                const originalConditionRatingList: StructureElement[] = yield select(getOriginalConditionRating);
                const displayElementList: StructureElement[] = yield select(getDisplayElementList);

                const ratedElementCodeData: ElementCodeData[] = yield select(getRatedElementCodeData);
                const elementCodeDataList: ElementCodeData[] = yield select(getElementCodeDataList);

                const maintenanceActions: MaintenanceActionModel[] = yield select(getMaintenanceActions);
                const inspectionComment: string = yield select(getInspectionComment);

                const stateToSave = {
                    id: 'appState',
                    currentStructure: currentStructure,
                    inspectionData: {
                        currentInspection: inspectionState,
                        previoustInspection: previousInspection,
                        previoustInspectionsList: previousInspectionList,
                    },
                    conditionRating: {
                        ratedElements: ratedElements,
                        originalConditionRating: originalConditionRatingList,
                        displayConditionRatingElements: displayElementList,
                        ratedElementCodeData: ratedElementCodeData,
                        elementCodeDataList: elementCodeDataList,
                    },
                    maintenanceAction: {
                        maintenanceActions: maintenanceActions,
                    },
                    inspectionComment: inspectionComment,
                    timestamp: Date.now(),
                } as ReduxApplicationState;

                // Try the put operation again
                yield call([db.reduxApplicationState, db.reduxApplicationState.put], stateToSave);

                saved = true;
                console.log('Redux state saved successfully after retry');
            } catch (retryError) {
                retryCount--;
                if (retryCount === 0) {
                    console.error('Failed to save after multiple retries', retryError);
                    if (error instanceof Error) {
                        yield put(setLocaStorageError(error.message));
                    } else {
                        yield put(setLocaStorageError(error));
                    }
                }
            }
        }
    } finally {
        yield put(setShowLoading(false));
    }
}

export function* mapLocalStorageToState() {
    try {
        yield put(setShowLoading(true));

        // Ensure database is ready
        yield call(ensureDbReady);

        // Get the saved state using original method
        const savedState: ReduxApplicationState = yield call(() =>
            db.reduxApplicationState.get('appState')
        );

        if (savedState) {
            yield put(setCurrentStructure(savedState.currentStructure));
            // Map inspection
            yield put(setCurrentInspection(savedState.inspectionData.currentInspection));
            yield put(setPreviousInspectionData(savedState.inspectionData.previoustInspection));
            yield put(setPreviousInspectionListFromSavedState(savedState.inspectionData.previoustInspectionsList));

            // Map condition rating
            yield put(setReatedElement(savedState.conditionRating.ratedElements));
            yield put(setOriginalConditionRating(savedState.conditionRating.originalConditionRating));
            yield put(setDisplayConditionRatingElements(savedState.conditionRating.displayConditionRatingElements));

            yield put(setReatedElementCode(savedState.conditionRating.ratedElementCodeData));
            yield put(setOriginalElementCodeDataList(savedState.conditionRating.elementCodeDataList));

            // Map maintenance action
            yield put(setMaintenanceActionList(savedState.maintenanceAction.maintenanceActions));

            // Map inspection comment
            yield put(setInspectionComment(savedState.inspectionComment));

            console.log('State loaded from IndexedDB successfully');
        } else {
            console.log('No state found in IndexedDB');
        }
    } catch (error) {
        console.error('Error loading state from IndexedDB:', error);
        yield put(setLocaStorageError('Failed to load saved data. Please try again.'));

        // Implement retry logic here
        let retryCount = 2;
        let loaded = false;

        while (retryCount > 0 && !loaded) {
            try {
                console.log(`Retrying load operation (${retryCount} attempts left)...`);
                // Wait a bit before retrying
                yield call(delay, 800);

                // Try the get operation again
                const savedState: ReduxApplicationState = yield call(() =>
                    db.reduxApplicationState.get('appState')
                );

                if (savedState) {
                    // Map all state again
                    yield put(setCurrentInspection(savedState.inspectionData.currentInspection));
                    yield put(setPreviousInspectionData(savedState.inspectionData.previoustInspection));
                    yield put(setPreviousInspectionListFromSavedState(savedState.inspectionData.previoustInspectionsList));
                    yield put(setReatedElement(savedState.conditionRating.ratedElements));
                    yield put(setMaintenanceActionList(savedState.maintenanceAction.maintenanceActions));
                    yield put(setInspectionComment(savedState.inspectionComment));

                    loaded = true;
                    console.log('State loaded successfully after retry');
                }
            } catch (retryError) {
                retryCount--;
            }
        }
    } finally {
        yield put(setShowLoading(false));
    }
}

export function* checkIfLocalStorageHasValue() {
    try {
        // Ensure database is ready
        yield call(ensureDbReady);

        const exists: number = yield db.reduxApplicationState.count();

        yield put(setLocalStorageFlag(exists > 0));
    } catch (error: any) {
        console.error('Error checking local storage:', error);

        if (error instanceof Error) {
            yield put(setLocaStorageError(error.message));
        } else {
            yield put(setLocaStorageError(error));
        }

        // Default to false if there's an error
        yield put(setLocalStorageFlag(false));
    }
}

export function* removeStateFromLocalStorage() {
    try {
        // Ensure database is ready
        yield call(ensureDbReady);

        // Use the original clear method
        yield call([db.reduxApplicationState, db.reduxApplicationState.clear]);

        yield call([db.capturedImages, db.capturedImages.clear]);

        yield put(setLocalStorageFlag(false));

        console.log('All data cleared from IndexedDB');
    } catch (error) {
        console.error('Error clearing IndexedDB:', error);

        if (error instanceof Error) {
            yield put(setLocaStorageError(error.message));
        } else {
            yield put(setLocaStorageError(error));
        }
    }
}

// Helper function for delay
function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}