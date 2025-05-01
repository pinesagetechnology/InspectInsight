import React, { useEffect } from 'react';

const RoutePreloader: React.FC = () => {
    useEffect(() => {
        // This effect triggers a fetch for each main route to ensure they're cached
        const preCacheRoutes = async () => {
            const routes = [
                '/',
                '/Home',
                '/inspectionDetail',
                '/conditionRating',
                '/ifcViewer',
                '/inspectorComments',
                '/inspectionReview',
                '/previousInspection',
                '/previousInspectionDetal'
            ];

            console.log('Pre-caching application routes...');

            // Fetch each route one by one to cache it
            for (const route of routes) {
                try {
                    // Use cache: 'reload' to ensure fresh content
                    const response = await fetch(route, {
                        headers: { 'Cache-Control': 'no-cache' },
                        cache: 'reload'
                    });

                    if (response.ok) {
                        console.log(`Pre-cached route: ${route}`);
                    } else {
                        console.warn(`Failed to pre-cache route: ${route}, status: ${response.status}`);
                    }
                } catch (error) {
                    console.warn(`Error pre-caching route ${route}:`, error);
                }
            }

            console.log('Route pre-caching complete');
        };

        // Only run if service worker is supported
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            // Delay the pre-caching to not interfere with initial app load
            const timer = setTimeout(() => {
                preCacheRoutes();
            }, 2000); // 2 second delay

            return () => clearTimeout(timer);
        }
    }, []);

    return null; // This component doesn't render anything
};

export default RoutePreloader;