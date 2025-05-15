
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
    ifcPopulatedConditionRatingData?: IFCPopulatedConditionRating[];
}

export interface MaintenanceActionEntity {
    id: string;
    elementId: string;
    elementCode: string;
    elementDescription: string;
    mmsActNo: string;
    activityDescription: string;
    inspectionComment: string;
    units: string;
    dateForCompletion: string; // Date in ISO string format
    probability: string;
    consequenceOfInteraction: string;
    isComplete: boolean;
    activityInactionRisk: string;
    photos: MaintenanceImageFileEntity[];
}

export interface ConditionRatingEntity {
    conditionRatingId: string;
    elementId: string;
    elementCode?: string;
    elementDescription?: string;
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

export interface IFCPopulatedConditionRating {
  elementCode: string;
  totalQty: number;
  condition: [number, number, number, number];
}