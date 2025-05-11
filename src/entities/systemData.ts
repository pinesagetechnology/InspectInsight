import { ElementCodeData } from "./structure";

export interface MMSActivity {
    code: string;
    group: string;
    description: string;
    unitOfMeasurement: string;
}

export interface SystemBaseDataEntity {
    id: string;
    category: string;
    data: MMSActivity[] | ElementCodeData[] | any[];
}