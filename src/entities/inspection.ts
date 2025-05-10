
export interface InspectionEntity {
    id: string;
    structureId: string;
    inspectionType: string;
    inspectionLevel: string;
    temperature: number;
    inspectorName: string;
    inspectionDate: string; // Date in ISO string format
    nextInspectionProposedDate: string; // Date in ISO string format
    weather: string;
    engineerName: string;
    rate?: string;
    comment?: string;
    maintenanceActions: MaintenanceActionEntity[];
    conditionRatings?: ConditionRatingEntity[];
    inspectionStatus: string;
}

export interface MaintenanceActionEntity {
    id: string;
    elementId: number;
    elementCode: string;
    elementDescription: string;
    mmsActNo: string;
    activityDescription: string;
    inspectionComment: string;
    units: number;
    dateForCompletion: string; // Date in ISO string format
    probability: string;
    consequenceOfInteraction: string;
    isComplete: boolean;
    activityInactionRisk: string;
    photos: MaintenanceImageFileEntity[];
}

export interface ConditionRatingEntity {
    conditionRatingId: string;
    elementId: number | string;
    elementCode?: string;
    ratings: number[];
}

export interface MaintenanceImageFileEntity {
    dbId: string;
    fileName: string;
    url: string;
    apiResponse?: uploadAPIResponse
}

export interface uploadAPIResponse {
    id: string;
    name: string;
}