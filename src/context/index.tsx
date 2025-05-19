// src/context/index.tsx
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
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
    isAuthenticated: false,
    isInitializing: true,
    login: async () => { },
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
            try {
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
                            // Token expired, clear localStorage
                            handleLogout(false); // Pass false to avoid dispatching action during initialization
                        }
                    } catch (error) {
                        console.error('Error initializing auth:', error);
                        handleLogout(false); // Pass false to avoid dispatching action during initialization
                    }
                }
            } finally {
                setIsInitializing(false);
            }
        };

        initializeAuth();
    }, []);

    // Update authentication status when token changes in Redux
    useEffect(() => {
        // Only update state after initialization is complete
        if (!isInitializing) {
            const hasToken = !!token;
            if (hasToken !== isAuthenticated) {
                setIsAuthenticated(hasToken);
            }
        }
    }, [token, isInitializing, isAuthenticated]);

    const handleLogin = async (email: string, password: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            try {
                dispatch({
                    type: actions.LOGIN,
                    payload: { email, password, onSuccess: resolve, onError: reject }
                } as PayloadAction<any>);
            } catch (error) {
                reject(error);
            }
        });
    };

    const handleLogout = (dispatchAction = true) => {
        // Only dispatch when needed (not during initialization)
        if (dispatchAction) {
            dispatch({ type: actions.LOGOUT } as PayloadAction);
        }

        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isInitializing,
                login: handleLogin,
                logout: () => handleLogout(true),
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};