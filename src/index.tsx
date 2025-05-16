import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './store';
import { MainComponent } from './main';

// Special function to ensure WASM files are properly cached
const preloadWasmFiles = async () => {
    try {
        const isNative = window.capacitor?.isNative;
        const wasmBasePath = isNative ? 'public/static/wasm/' : '/static/wasm/';
        
        // List of WASM files to preload
        const wasmFiles = [
            `${wasmBasePath}web-ifc.wasm`,
            `${wasmBasePath}web-ifc-mt.wasm`
        ];

        console.log('Preloading WASM files...', { isNative, wasmBasePath });

        const preloadPromises = wasmFiles.map(async (wasmPath) => {
            try {
                if (!isNative) {
                    // In web environment, use cache API
                    const cacheResponse = await caches.match(wasmPath);
                    if (cacheResponse) {
                        console.log(`WASM file already cached: ${wasmPath}`);
                        return;
                    }
                }

                // Fetch the WASM file
                console.log(`Fetching WASM file: ${wasmPath}`);
                const response = await fetch(wasmPath, {
                    cache: 'force-cache',
                    headers: {
                        'Content-Type': 'application/wasm'
                    }
                });

                if (response.ok) {
                    console.log(`Successfully preloaded WASM: ${wasmPath}`);
                    
                    if (!isNative) {
                        // Only use cache API in web environment
                        const cache = await caches.open('wasm-files-v1');
                        await cache.put(wasmPath, response.clone());
                    }
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