import { RootState } from "../rootReducers";

export const getUserId = (state: RootState) => {
    if(!state.AuthState.userId) {
        return localStorage.getItem('loggedInUserId');
    } else {
        return state.AuthState.userId;
    }
};
export const getEmail = (state: RootState) => state.AuthState.email;
export const getToken = (state: RootState) => {
    if(!state.AuthState.token) {
        return localStorage.getItem('token');
    } else {
        return state.AuthState.token;
    }
}
export const getRefreshToken = (state: RootState) => state.AuthState.refreshToken;
