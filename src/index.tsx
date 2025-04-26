// src/index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './store';
import { MainComponent } from './main';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Determine the base URL for routing
const getBasename = () => {
    const path = window.location.pathname;
    // If root path, return empty string
    if (path === '/' || path === '') return '';

    // Otherwise, get the path up to the last slash
    const lastSlashIndex = path.lastIndexOf('/');
    if (lastSlashIndex <= 0) return '';

    return path.substring(0, lastSlashIndex);
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
            <BrowserRouter basename={getBasename()}>
                <MainComponent />
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
);

// Register the service worker

serviceWorkerRegistration.register({
    onSuccess: (registration) => {
        console.log('Service Worker registration successful with scope: ', registration.scope);
    },
    onUpdate: (registration) => {
        console.log('Service Worker updated. New content is available.');
        // Note: The update notification will be handled by the ServiceWorkerUpdate component
    }
})


// Log some info about the environment
console.log(`Running in ${process.env.NODE_ENV} mode`);
console.log(`Public URL: ${process.env.PUBLIC_URL || '/'}`);