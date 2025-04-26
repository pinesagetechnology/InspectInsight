import { InspectionEntity } from "../entities/inspection";
import api, { setAuthorize } from "../helper/api";

export const fetchListOfPreviousInspections = async (structureId: string) => {
    await setAuthorize();
    const result = await api.get(`api/Inspection/list/${structureId}?count=10`);

    return result.data as InspectionEntity;
};

export const createInspectionlData = async (data: InspectionEntity) => {
    await setAuthorize();

    const result = await api.post("api/Inspection", data);

    return result.data as string;
};

export const updateInspectionlData = async (data: InspectionEntity, ) => {
    await setAuthorize();

    await api.put("api/Inspection", data);
};
