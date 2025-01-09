import api from "../helper/api"

export const checkSystemAvailability = async (): Promise<any> => {
    try {
        const response = await api.get("/health");
        
        return response.data;
    } catch {
        return false;
    }
};