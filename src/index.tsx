// src/index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './store';
import { MainComponent } from './main';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
    <Provider store={store}>
        <BrowserRouter basename={window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'))}>
            <MainComponent />
        </BrowserRouter>
    </Provider>
);

// Register the service worker
serviceWorkerRegistration.register({
    onSuccess: (registration) => {
        console.log('Service Worker registration successful with scope: ', registration.scope);
    },
    onUpdate: (registration) => {
        console.log('Service Worker updated. New content is available.');
        
        // Optional: Show a notification to the user about the update
        const updateAvailable = window.confirm(
            'A new version of the app is available. Would you like to refresh to update?'
        );
        
        if (updateAvailable && registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    }
});