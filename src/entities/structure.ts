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

export interface ElementData {
    Entity: string;
    Name?: string;
    modelID?: string;
    expressID: number;
    relations?: string;
}

export interface Property {
    expressID: number;
    type: number;
    GlobalId?: { value: string; type: number; name: string };
    OwnerHistory?: { value: number; type: number };
    Name?: { value: string; type: number; name: string };
    Description?: string | null;
    ObjectType?: { value: string; type: number; name: string };
    ObjectPlacement?: { value: number; type: number };
    Representation?: { value: number; type: number };
    Tag?: { value: string; type: number; name: string };
    OverallHeight?: { value: number; type: number; name: string };
    OverallWidth?: { value: number; type: number; name: string };
}

export interface StructureElement {
    data: ElementData;
    condition?: number[]
    children: StructureElement[];
    properties?: Property;
    quantity: number;
}
