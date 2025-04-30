// src/components/auth/protectedRoute.tsx
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { RoutesValueEnum } from '../../enums';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../../context';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isInitializing } = useAuth();
    const navigate = useNavigate();

    // Handle navigation after initialization is complete
    useEffect(() => {
        if (!isInitializing && !isAuthenticated) {
            navigate(`/${RoutesValueEnum.Login}`, { replace: true });
        }
    }, [isInitializing, isAuthenticated, navigate]);

    if (isInitializing) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    // If not authenticated after initialization, render nothing while redirect happens
    if (!isAuthenticated) {
        return <Box sx={{ display: 'none' }} />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;