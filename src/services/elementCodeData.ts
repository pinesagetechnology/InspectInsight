import { SystemBaseDataEntity } from "../entities/systemData";
import { setAuthorize } from "../helper/api"
import mockData from '../mockData/elementCodeData.json';

export const fetchElementsCodeData = async () => {
    await setAuthorize();

    const result: SystemBaseDataEntity = mockData;

    return result.data;
}
