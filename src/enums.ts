export enum RoutesValueEnum {
    Login = '',
    Home = 'Home',
    InspectionDetail = 'inspectionDetail',
    ConditionRating = 'conditionRating',
    IFCViewer = 'ifcViewer',
    InspectorComments = 'inspectorComments',
    InspectionReview = 'inspectionReview',
    PreviousInspection = 'previousInspection',
    PreviousInspectionDetail = 'previousInspectionDetal',
    BridgeInspectionApp = 'BridgeInspectionApp',
}

export enum BrowserStorageKey {
    StructureData = "structureData",
    InspectionDetail = "inspectionDetail",
    ConditionRating = "conditionRating",
    MaintenanceAction = "maintenanceAction",
    InspectionComment = "inspectionComment",
}

export enum InspectionStatusEnum {
    InProgress = 'In Progress',
    Completed = 'Completed',
    ToDo = 'ToDo',
}
