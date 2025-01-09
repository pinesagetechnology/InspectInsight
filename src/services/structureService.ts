import { Structure, StructureElement } from "../entities/structure";
import api from "../helper/api"
import mockStructures from '../mockData/get_structure.json';

export const getStructureData = async () => {
    await new Promise(resolve => setTimeout(resolve, 3000));

    let result = await api.get("api/Structure");

    return result.data as Structure[];
}
