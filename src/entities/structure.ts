import { InspectionEntity } from "./inspection";

export interface Structure {
    id: string;
    name: string;
    code: string;
    type: string;
    over: string;
    at: string;
    LGA: string;
    overalLength: string;
    overalWidth: string;
    maxCmy: number;
    maxMd: number;
    minVert: number;
    lastInspectionDate: string; // Date in ISO string format
    location: Location;
    metadata?: Metadata;
    elementMetadata: StructureElement[];
    elementsCodeData: ElementCodeData[];
    previousInspection?: InspectionEntity;
    precinct?: string;
    equipments?: string[];
    ifcfileaddress?: string;
    urgency: string;
    ifcCalculatedElementCodeData?: ClaculatedIFCElementCodeData[];
    totalIFCElementQuantity?: number;
    totalElementCodeQuantity?: number;
}

export interface Location {
    latitude: number;
    longitude: number;
    region: string;
}

export interface Metadata {
    bridgeMaterial: string;
    yearBuilt: number;
}

export interface ElementData {
    Entity: string;
    Name?: string;
    expressID: number;
    relations?: string;
}

export interface StructureElement {
    data: ElementData;
    identityData?: IdentityData;
    condition?: number[]
    children: StructureElement[];
    quantity: number;
    ifcElementRatingValue?: string;
    isSplit?: boolean;
    splitElements?: StructureElement[];
    isSaved?: boolean;
}

export interface ElementCodeData {
    id: string;
    category: string;
    elementCode: string;
    description: string;
    unit: string;
    totalQty: string;
    condition?: number[]
}

export interface ClaculatedIFCElementCodeData {
    elementCode: string;
    totalQty: number;
}

export interface IdentityData {
    assetId: string;
    names: string;
    section: string;
    structure: string;
}