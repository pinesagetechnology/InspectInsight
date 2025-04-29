import React from 'react';
import { Navigate } from 'react-router-dom';
import { RoutesValueEnum } from '../../enums';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../../context';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isInitializing } = useAuth();

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

    if (!isAuthenticated) {
        return <Navigate to={`/${RoutesValueEnum.Login}`} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;