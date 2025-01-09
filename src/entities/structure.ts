import { InspectionEntity } from "./inspection";

export interface Structure {
    id: string;
    name: string;
    code: string;
    type: string;
    overal: string;
    at: string;
    overalLength: string;
    overalWidth: string;
    maxCmy: number;
    maxMd: number;
    lastInspectionDate: string; // Date in ISO string format
    location: Location;
    metadata?: Metadata;
    elementMetadata: StructureElement[];
    inspections?: InspectionEntity[];
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

export interface StructureElement {
    elementId: string;
    code: string;
    description: string;
    quantity: number;
    unit: string;
    elementCode: string;
    eciChannel: string;
    condition?: number[] 
    children?: StructureElement[]; // Optional children to handle hierarchy
}
