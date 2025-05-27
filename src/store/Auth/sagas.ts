// src/store/Auth/sagas.ts
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

export function* userLogin(action: PayloadAction<any>) {
    try {
        // Extract callback functions if provided
        const { email, password, onSuccess, onError } = action.payload;
        const authRequest: AuthRequest = { email, password, remoteIpAddress: '' };

        // Call the login service
        const response: AuthResponse = yield call(services.loginUser, authRequest);

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

            // Call success callback if provided
            if (onSuccess && typeof onSuccess === 'function') {
                onSuccess();
            }
        }
    } catch (error) {
        console.error("Login error: ", error);

        // Call error callback if provided
        if (action.payload.onError && typeof action.payload.onError === 'function') {
            action.payload.onError(error);
        }
    }
}

export function* userLogout() {
    try {
        const userId: string = yield select(getUserId);

        if (userId) {
            // Call the logout service if we have a token and userId
            yield call(services.logoutUser, userId);
        }

        // Clear localStorage first
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('loggedInUserId');

        yield put(setLoginData({} as AuthData)); // Clear auth data in Redux

        yield put(setShowLoading(false));
    } catch (error) {
        console.error("Logout error: ", error);
        // Clear localStorage first
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('loggedInUserId');
        yield put(setShowLoading(false));
    }
}