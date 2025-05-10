export interface InspectionModel {
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
}

export interface MaintenanceImageFile {
    dbId: string;
    fileName: string;
    url: string;
}

export interface DeleteImagePayload {
    id: string;
    updatedImageList: MaintenanceImageFile[];
}

export interface MaintenanceActionModel {
    id: string;
    elementId: number | string;
    elementCode: string;
    elementDescription: string;
    mmsActNo: string;
    activityDescription: string;
    inspectionComment: string;
    units: number | string;
    dateForCompletion: string; // Date in ISO string format
    probability: string;
    consequenceOfInteraction: string;
    isComplete: boolean;
    activityInactionRisk: string;
    photos: MaintenanceImageFile[];
    isSectionExpanded: boolean;
    mode: number;
}

export interface InspectionFomrValidationPayload {
    name: string;
    value: string;
}