import { AxiosResponse } from "axios";
import { uploadAPIResponse } from "../entities/inspection";
import assetApi from "../helper/assetAPI";

export const uploadImage = async (file: File, path: string): Promise<uploadAPIResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    // Use assetApi instance instead of direct axios call
    const response: AxiosResponse<uploadAPIResponse> = await assetApi.post(
        '/api/assets/upload', 
        formData, 
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    return response.data;
};

export const deleteImage = async (id: string): Promise<void> => {
    await assetApi.delete(`/api/assets/${id}`);
};

export const getAssetById = async (id: string): Promise<any> => {
    const response = await assetApi.get(`/api/assets/${id}`);
    return response.data;
};

export const listAssets = async (path: string): Promise<any[]> => {
    const response = await assetApi.get(`/api/assets?path=${path}`);
    return response.data;
};