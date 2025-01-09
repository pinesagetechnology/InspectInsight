import {
    MaintenanceImageFile,
    UploadAPIResponse
} from "../models/inspectionModel";
import axios, { AxiosResponse } from "axios";

export const uploadImage = async (data: MaintenanceImageFile, path: string) => {
    if (!data.file) {
        console.log("Please select a file first.");
        return;
    }

    const formData = new FormData();
    formData.append('file', data.file); // Match the name of the form field ('file') with your API parameter

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
