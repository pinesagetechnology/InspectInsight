import { AuthRequest } from "../entities/auth";
import api, { setAuthorize } from "../helper/authAPI";

export const loginUser = async (request: AuthRequest) => {
    const result = await api.post("api/User/login", { 
        email: request.email, 
        password: request.password,
        remoteIpAddress: "" 
    });
    return result.data;
}

export const logoutUser = async (userId: string) => {
    await setAuthorize();;
    const uri = `api/User/logout?userId=${userId}`;
    const result = await api.post(uri, {});
    return result.data;
}