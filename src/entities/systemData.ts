export interface MMSActivity {
    code: number;
    description: string;
    inventoryUnit: string;
    unitOfMeasurement: string;
    assetCode: string;
}

export interface SystemBaseDataEntity {
    id: string;
    category: string;
    data: MMSActivity[];
}