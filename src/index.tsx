// src/index.tsx - Updated to improve service worker registration
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './store';
import { MainComponent } from './main';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Special function to ensure WASM files are properly cached
const preloadWasmFiles = async () => {
    try {
        // List of WASM files to preload
        const wasmFiles = [
            '/web-ifc.wasm',
            '/web-ifc-mt.wasm'
        ];

        console.log('Preloading WASM files...');

        const preloadPromises = wasmFiles.map(async (wasmPath) => {
            try {
                // First, try to get from cache
                const cacheResponse = await caches.match(wasmPath);

                if (cacheResponse) {
                    console.log(`WASM file already cached: ${wasmPath}`);
                    return;
                }

                // If not in cache, fetch and prime the cache
                console.log(`Fetching WASM file: ${wasmPath}`);
                const response = await fetch(wasmPath, {
                    cache: 'force-cache' // Force browser to use cache
                });

                if (response.ok) {
                    console.log(`Successfully preloaded WASM: ${wasmPath}`);

                    // Get the cache or create it if it doesn't exist
                    const cache = await caches.open('wasm-files-v1');

                    // Put the response in the cache
                    await cache.put(wasmPath, response.clone());
                } else {
                    console.warn(`Failed to preload WASM: ${wasmPath}, status: ${response.status}`);
                }
            } catch (error) {
                console.error(`Error preloading WASM file ${wasmPath}:`, error);
            }
        });

        await Promise.all(preloadPromises);
        console.log('WASM preloading complete');
    } catch (error) {
        console.error('Error in WASM preloading:', error);
    }
};

// Get the container element
const container = document.getElementById('root');
if (!container) {
    throw new Error('Root element not found! Add a div with id="root" to your HTML.');
}

const root = createRoot(container);

// Render the app
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <MainComponent />
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
);

// Register the service worker with enhanced options
serviceWorkerRegistration.register({
    onSuccess: (registration) => {
        console.log('Service Worker registration successful with scope: ', registration.scope);

        // Preload WASM files after service worker is active
        preloadWasmFiles();
    },
    onUpdate: (registration) => {
        console.log('Service Worker updated. New content is available.');

        // We could auto-refresh, but better to let the ServiceWorkerUpdate component handle it
        // for better UX
    },
    onOffline: () => {
        console.log('App is in offline mode. Using cached resources.');
    },
    onFailed: (error) => {
        console.error('Service Worker registration failed:', error);
    }
});

// Log some info about the environment
console.log(`Running in ${process.env.NODE_ENV} mode`);
console.log(`Public URL: ${process.env.PUBLIC_URL || '/'}`);

// Function to check if cache contains the routes we need
const verifyCachedRoutes = async () => {
    try {
        // Only do this check in production
        if (process.env.NODE_ENV !== 'production') return;

        // Wait to ensure service worker is registered
        await new Promise(resolve => setTimeout(resolve, 3000));

        const allCaches = await caches.keys();
        console.log('Available caches:', allCaches);

        // Routes that should be cached
        const criticalRoutes = [
            '/',
            '/Home',
            '/inspectionDetail',
            '/conditionRating'
        ];

        let allCached = true;

        // Check each cache for our routes
        for (const cacheName of allCaches) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();

            for (const route of criticalRoutes) {
                // Check if route exists in this cache
                const cached = keys.some(req =>
                    req.url.endsWith(route) ||
                    req.url.endsWith(route + '.html') ||
                    req.url.endsWith(route + '/index.html')
                );

                if (cached) {
                    console.log(`Route ${route} found in cache ${cacheName}`);
                } else {
                    allCached = false;
                }
            }
        }

        if (allCached) {
            console.log('All critical routes are cached! App is ready for offline use.');
        } else {
            console.warn('Some critical routes are not cached! App may not work fully offline.');
        }
    } catch (error) {
        console.error('Error verifying cached routes:', error);
    }
};

// Run the verification check after some delay
if ('caches' in window) {
    setTimeout(verifyCachedRoutes, 5000);
}