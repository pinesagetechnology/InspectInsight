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
    timestamp?: number; // Optional timestamp for version control
}

export interface StructureState {
    id: string;
    structures: Structure[];
    timestamp?: number; // Optional timestamp for version control
}

export class AppDatabase extends Dexie {
    public reduxApplicationState!: Table<ReduxApplicationState, string>;
    public structureState!: Table<StructureState, string>;

    constructor() {
        super('AppDatabase');

        // Define database schema with versioning
        this.version(3).stores({
            reduxApplicationState: 'id', // define the primary key for the reduxApplicationState table
            structureState: 'id', // define the primary key for the structureState table
        });

        // Define ready event handler
        this.on('ready', () => {
            console.log('Database ready');
        });

        // Handle blocked connections
        this.on('blocked', () => {
            console.warn('Database blocked - another instance may be running');
        });

        // Define close event handling
        this.on('close', () => {
            console.warn('Database connection closed');
        });
    }
}

// Create a singleton instance of the database
export const db = new AppDatabase();

// Ensure the database is ready for use
export const ensureDbReady = async (): Promise<void> => {
    try {
        // Check if the database is already open
        if (db.isOpen()) {
            console.log('Database is already open');
            return;
        }

        await db.open();
        console.log('Database opened successfully');
    } catch (error) {
        console.error('Failed to open database', error);

        // In case of a critical database error, try to recover
        if (error instanceof Error &&
            (error.message.includes('InvalidStateError') ||
                error.message.includes('AbortError') ||
                error.message.includes('QuotaExceededError'))) {

            console.warn('Critical database error detected. Attempting recovery...');
            try {
                // Close the database first if it's open
                if (db.isOpen()) {
                    await db.close();
                }

                // Wait a moment to ensure resources are released
                await new Promise(resolve => setTimeout(resolve, 500));

                // Try to open again
                await db.open();
                console.log('Database recovery successful');
            } catch (recoveryError) {
                console.error('Database recovery failed', recoveryError);

                // Last resort: attempt to delete and recreate the database
                try {
                    console.warn('Attempting to delete and recreate database...');
                    await Dexie.delete('AppDatabase');
                    // Create a new instance
                    const tempDb = new AppDatabase();
                    await tempDb.open();
                    console.log('Database recreated successfully');
                } catch (deleteError) {
                    console.error('Failed to recreate database', deleteError);
                    throw new Error('Unable to initialize database storage. Please try clearing your browser data.');
                }
            }
        } else {
            throw error; // Re-throw for non-critical errors
        }
    }
};

// Add utility function to check database health
export const checkDatabaseHealth = async (): Promise<boolean> => {
    try {
        if (!db.isOpen()) {
            await db.open();
        }

        // Try a simple operation
        const count = await db.reduxApplicationState.count();
        console.log(`Database health check: ${count} items found`);
        return true;
    } catch (error) {
        console.error('Database health check failed:', error);
        return false;
    }
};