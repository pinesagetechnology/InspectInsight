import axios from 'axios';
import { setUpgenAIAPIEnv } from "../configuration";
import { AuthResponse } from 'entities/auth';
import authAPI from './authAPI';

setUpgenAIAPIEnv();
const genaiApiUrl = window.USER_API_URL;

const genaiAPI = axios.create({
    baseURL: genaiApiUrl,
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
    genaiAPI.interceptors.request.use(config => {
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
genaiAPI.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');

                if (!refreshToken) {
                    // No refresh token, can't retry
                    return Promise.reject(error);
                }

                // Call refresh token endpoint
                const response: AuthResponse = await authAPI.post('api/User/refresh-token', { refreshToken });

                if (response && response.token) {
                    const newToken = response.token;

                    // Update token in localStorage
                    localStorage.setItem('token', newToken);

                    // Update headers for future requests
                    genaiAPI.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

                    // Update the original request headers
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

                    // Retry the original request
                    return genaiAPI(originalRequest);
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);

                // Failed to refresh, clear tokens and return to login
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('loggedInUserId');

                return Promise.reject(refreshError);
            }
        }

        // For other errors, just reject
        return Promise.reject(error);
    }
);

export const revokeAccess = () => {
    delete genaiAPI.defaults.headers.common.Authorization;
};

export default genaiAPI;