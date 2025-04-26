import {
    MaintenanceImageFile,
    UploadAPIResponse
} from "../models/inspectionModel";
import axios, { AxiosResponse } from "axios";
import { getImageById } from "../helper/db";

export const uploadImage = async (data: MaintenanceImageFile, path: string) => {
    const image = await getImageById(data.dbId);

    if (!image) {
        console.log("unable to find image or nvalid file");
        return;
    }

    const file = new File([image.blob], image.fileName, { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', file);

    const response: AxiosResponse<UploadAPIResponse> = await axios.post(`${window.ASSET_URL}api/assets/upload?path=${path}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data as UploadAPIResponse;
};

export const deleteImage = async (id: string) => {
    await axios.delete(`${window.ASSET_URL}api/assets/${id}`);
};
