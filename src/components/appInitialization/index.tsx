import React, { useEffect, useState } from 'react';
import { CircularProgress, Box, Typography, Button } from '@mui/material';
import { ensureDbReady } from '../../helper/db';

interface AppInitializationProps {
    children: React.ReactNode;
}

// This component handles initialization of the application
// and ensures all prerequisites are met before rendering the main app
const AppInitialization: React.FC<AppInitializationProps> = ({ children }) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [initAttempts, setInitAttempts] = useState(0);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                // Wait for database to be ready
                await ensureDbReady();

                // Here you can add other initialization steps as needed
                // For example, load essential configuration or check for permissions

                // Mark initialization as complete
                setIsInitialized(true);
            } catch (err) {
                console.error('Failed to initialize app:', err);
                setError(err instanceof Error ? err.message : 'Unknown initialization error');
            }
        };

        if (!isInitialized && !error) {
            initializeApp();
        }
    }, [isInitialized, error, initAttempts]);

    const handleRetry = () => {
        setError(null);
        setInitAttempts(prev => prev + 1);
    };

    // If there was an error, show an error message with retry button
    if (error) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                p={3}
                textAlign="center"
            >
                <Typography variant="h5" color="error" gutterBottom>
                    Unable to start the application
                </Typography>
                <Typography variant="body1" component="p">
                    There was a problem initializing the app database: {error}
                </Typography>
                <Typography variant="body2" component="p">
                    Try closing other tabs with this app open, or try clearing your browser data.
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleRetry}
                    sx={{ mt: 2 }}
                >
                    Retry
                </Button>
            </Box>
        );
    }

    // If still initializing, show a loading spinner
    if (!isInitialized) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
            >
                <CircularProgress size={60} thickness={4} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Starting application...
                </Typography>
            </Box>
        );
    }

    // Once initialized, render the app
    return <>{children}</>;
};

export default AppInitialization;