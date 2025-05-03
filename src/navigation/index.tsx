import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const useNavigationManager = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const getCurrentPageName = () => {
        return location.pathname.replace(/^\//, '');
    }

    const goTo = (pageName: string) => {
        pageName = pageName.replace(/^\//, '');
        navigate(`/${pageName}`);
    }

    const goBack = () => {
        navigate(-1);
    }

    return {
        getCurrentPageName,
        goTo,
        goBack
    };
};

export const useOfflineNavigation = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Store the current path when online
        if (navigator.onLine) {
            sessionStorage.setItem('lastOnlinePath', location.pathname);
        }
    }, [location, navigator.onLine]);

    useEffect(() => {
        // Handle going offline
        const handleOffline = () => {
            // Save current state to localStorage if needed
            const currentPath = location.pathname;
            sessionStorage.setItem('offlinePath', currentPath);
        };

        const handleOnline = () => {
            // Restore the last path when coming back online
            const offlinePath = sessionStorage.getItem('offlinePath');
            if (offlinePath && offlinePath !== location.pathname) {
                navigate(offlinePath, { replace: true });
            }
        };

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, [location, navigate]);
};