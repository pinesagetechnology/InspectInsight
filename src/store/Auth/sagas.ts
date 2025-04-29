import { takeLatest, call, put, select } from 'redux-saga/effects';
import * as actions from "./actions";
import { PayloadAction } from '@reduxjs/toolkit';
import { setLoginData } from './slice';
import * as services from "../../services/authService";
import { AuthData, TokenPayload } from '../../models/auth';
import { jwtDecode } from "jwt-decode";
import { getUserId } from './selectors';
import { initializeAuthHeaders } from '../../helper/initializeAuthHeaders';
import { AuthRequest, AuthResponse } from '../../entities/auth';
import { setShowLoading } from '../Common/slice';

export function* authRootSaga() {
    yield takeLatest(actions.LOGIN, userLogin);
    yield takeLatest(actions.LOGOUT, userLogout);
}

export function* userLogin(action: PayloadAction<AuthRequest>) {
    try {
        // Call the login service
        const response: AuthResponse = yield call(services.loginUser, action.payload);
        console.log("Login response: ", response);
        // Decode JWT to extract user information
        const tokenData: TokenPayload = jwtDecode(response.token);

        if (response) {
            const authData = {
                token: response.token,
                refreshToken: response.refreshToken,
                email: tokenData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
                userId: tokenData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
            } as AuthData

            // Store authentication data in Redux
            yield put(setLoginData(authData));

            // Store tokens in localStorage for persistence
            localStorage.setItem('token', response.token);
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('loggedInUserId', authData.userId || "");

            // Initialize all API instances with the new token
            yield call(initializeAuthHeaders);
        }
    } catch (error) {
        console.error("Login error: ", error);
        // You may want to add error handling here
        // yield put(setLoginError(error.message));
    }
}

export function* userLogout() {
    try {
        const token = localStorage.getItem('token');
        const userId: string = yield select(getUserId);
        console.log("User ID: ", userId);
        if (token && userId) {
            // Call the logout service if we have a token and userId
            yield call(services.logoutUser, userId, token);
        }

        yield put(setLoginData({} as AuthData)); // Clear auth data in Redux
        // Clear tokens from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('loggedInUserId');

        yield put(setShowLoading(false));
        // You might want to clear the auth state in Redux here as well
        // yield put(clearAuthState());
    } catch (error) {
        console.error("Logout error: ", error);
    }
}