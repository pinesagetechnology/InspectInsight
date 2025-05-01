// src/index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './store';
import { MainComponent } from './main';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

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