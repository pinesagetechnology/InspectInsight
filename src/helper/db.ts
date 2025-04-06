import Dexie, { Table } from 'dexie';
import { Structure, StructureElement } from '../entities/structure';
import { InspectionModel, MaintenanceActionModel } from '../models/inspectionModel';
import { InspectionEntity } from '../entities/inspection';

export interface ReduxApplicationState {
    id: 'appState', // fixed key
    inspectionData: {
        currentInspection: InspectionModel;
        previoustInspection: InspectionEntity;
        previoustInspectionsList: InspectionEntity[];
    },
    conditionRating: {
        ratedElements: StructureElement[];
    },
    maintenanceAction: {
        maintenanceActions: MaintenanceActionModel[];
    },
    inspectionComment: string;
}

export interface StructureState {
    id: string;
    structures: Structure[];
}

export class AppDatabase extends Dexie {
    public reduxApplicationState!: Table<ReduxApplicationState, string>; // define the table for Redux state
    public structureState!: Table<StructureState, string>;
    constructor() {
        super('AppDatabase');

        this.version(2).stores({
            reduxApplicationState: 'id', // define the primary key for the reduxApplicationState table
            structureState: 'id', // define the primary key for the structureState table
        });
    }
}
// Instantiate and export the database
export const db = new AppDatabase();