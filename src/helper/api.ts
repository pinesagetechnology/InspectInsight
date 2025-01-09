import axios from "axios";
import { setUpEnv } from "../configuration";

setUpEnv();

const apiUrl = window.API_URL;

const api = axios.create({
    baseURL: apiUrl,
    validateStatus: (status) => (status >= 200 && status < 300),
    // These headers are important as IE 11 can otherwise cache API responses
    // causing very weird behaviour
    headers: {
        'Cache-Control': 'no-cache,no-store,must-revalidate,max-age=0',
        Pragma: 'no-cache',
        Expires: 0
    }
});

api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if ((error?.response?.status === 400 || error?.response?.status === 401)
        && !!error.response.data) {
        return Promise.reject(error.response.data)
    }
    return Promise.reject(error);
});

api.defaults.headers.common.Accept = 'application/json';
api.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';

export const setAuthorize = async () => {
    // const msalInstance = new PublicClientApplication(msalConfig);
    // await msalInstance.initialize();

    // const activeAccount = msalInstance.getActiveAccount();
    // const accounts = msalInstance.getAllAccounts();
  
    // if (activeAccount && accounts.length > 0) {
    //   const authResult = await msalInstance.acquireTokenSilent({
    //     ...apiRequest,
    //     account: activeAccount || accounts[0]
    //   });
  
    //   api.defaults.headers.common.Authorization = `Bearer ${authResult.accessToken}`;
    // }
  };

  export const revokeAccess = () => {
    delete api.defaults.headers.common.Authorization;
  };

export default api;