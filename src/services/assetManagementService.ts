import {
    MaintenanceImageFile,
} from "../models/inspectionModel";
import axios, { AxiosResponse } from "axios";
import { getImageById } from "../helper/db";
import { MaintenanceImageFileEntity } from "../entities/inspection";

export const uploadImage = async (file: File, path: string) => {
    const formData = new FormData();
    formData.append('file', file);

    const response: AxiosResponse<MaintenanceImageFileEntity> = await axios.post(`${window.ASSET_URL}api/assets/upload?path=${path}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data as MaintenanceImageFileEntity;
};

export const deleteImage = async (id: string) => {
    await axios.delete(`${window.ASSET_URL}api/assets/${id}`);
};
