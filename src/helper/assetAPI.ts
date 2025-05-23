import axios from "axios";
import { setUpAssetAPIEnv } from "../configuration";
import authAPI from "./authAPI";
import { AuthResponse } from "entities/auth";

setUpAssetAPIEnv();

const assetApiUrl = window.ASSET_URL;
let refreshRetryCount = 0;
const MAX_RETRIES = 3;

const assetApi = axios.create({
    baseURL: assetApiUrl,
    validateStatus: (status) => (status >= 200 && status < 300),
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache,no-store,must-revalidate,max-age=0',
        Pragma: 'no-cache',
        Expires: 0
    }
});

export const setAuthorize = async () => {
    // Request interceptor to add Authorization header
    assetApi.interceptors.request.use(config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    }, error => {
        return Promise.reject(error);
    });
};

// Response interceptor to handle 401 → try token refresh
assetApi.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Check if we've exceeded max retries
            if (refreshRetryCount >= MAX_RETRIES) {
                // Clear tokens and reject
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('loggedInUserId');
                return Promise.reject(error);
            }

            refreshRetryCount++;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const token = localStorage.getItem('token');

                if (!refreshToken) {
                    return Promise.reject(error);
                }

                // Call refresh token endpoint
                const response: AuthResponse = await authAPI.post('api/User/refresh-token',
                    { token, refreshToken },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (response && response.token) {
                    const newToken = response.token;
                    localStorage.setItem('token', newToken);
                    assetApi.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    return assetApi(originalRequest);
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                if (refreshRetryCount >= MAX_RETRIES) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('loggedInUserId');
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const revokeAccess = () => {
    delete assetApi.defaults.headers.common.Authorization;
};

export default assetApi;