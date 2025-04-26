import assetAPI from "../helper/assetAPI";
import api from "../helper/api"

export const checkSystemAvailability = async (): Promise<any> => {
    try {
        // const response = await api.get("/health");
        const timestamp = Date.now();
        const response = await api.get(`/health?_=${timestamp}`);

        return response.data;
    } catch {
        return false;
    }
};

export const checkAssetAPIAvailability = async () => {
    try {
        const timestamp = Date.now();
        const response = await assetAPI.get(`/health?_=${timestamp}`);
        
        return response.data;
    } catch {
        return false;
    }
}
