import { Structure } from "../entities/structure";
import api, { setAuthorize } from "../helper/api"

export const getStructureData = async () => {
    await setAuthorize();

    let result = await api.get("api/Structure/list");

    return result.data as Structure[];
}
