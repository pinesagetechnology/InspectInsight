import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthorize as setApiAuthorize } from '../helper/api';
import { setAuthorize as setAssetApiAuthorize } from '../helper/assetAPI';
import { setAuthorize as setAuthApiAuthorize } from '../helper/authAPI';
import { getToken } from '../store/Auth/selectors';
import { jwtDecode } from 'jwt-decode';
import { TokenPayload } from '../models/auth';
import * as actions from '../store/Auth/actions';
import { PayloadAction } from '@reduxjs/toolkit';
import { AuthRequest } from '../entities/auth';

interface AuthContextProps {
    isAuthenticated: boolean;
    isInitializing: boolean;
    login: (username: string, password: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
    isAuthenticated: false,
    isInitializing: true,
    login: () => { },
    logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const dispatch = useDispatch();

    const token = useSelector(getToken);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    // Initialize auth state from localStorage on app start
    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('token');

            if (storedToken) {
                try {
                    // Check if token is expired
                    const tokenData: TokenPayload = jwtDecode(storedToken);
                    const expiryDate = new Date(tokenData.exp * 1000);
                    const now = new Date();

                    if (expiryDate > now) {
                        // Token is still valid - initialize APIs with stored token
                        await setApiAuthorize();
                        await setAssetApiAuthorize();
                        await setAuthApiAuthorize();
                        setIsAuthenticated(true);
                    } else {
                        // Token expired, try to refresh or clear
                        handleLogout();
                    }
                } catch (error) {
                    console.error('Error initializing auth:', error);
                    handleLogout();
                }
            }

            setIsInitializing(false);
        };

        initializeAuth();
    }, []);

    // Update authentication status when token changes in Redux
    useEffect(() => {
        setIsAuthenticated(!!token);
    }, [token]);

    const handleLogin = (email: string, password: string) => {
        dispatch({
            type: actions.LOGIN,
            payload: { email, password }
        } as PayloadAction<AuthRequest>);
    };

    const handleLogout = () => {
        dispatch({ type: actions.LOGOUT } as PayloadAction);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isInitializing,
                login: handleLogin,
                logout: handleLogout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};