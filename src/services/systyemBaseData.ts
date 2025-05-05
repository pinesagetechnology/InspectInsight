import { SystemBaseDataEntity } from "../entities/systemData";
import api, { setAuthorize } from "../helper/api"
import mockData from '../mockData/systemData.json';

export const fetchMMSActivityData = async () => {
    await setAuthorize();

    // let result = await api.get("api/Structure/list");
    const result: SystemBaseDataEntity = mockData;

    return result.data;
}
