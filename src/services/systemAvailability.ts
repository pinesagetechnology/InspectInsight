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