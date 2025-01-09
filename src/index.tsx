import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './store';
import { MainComponent } from './main';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
    <Provider store={store}>
        <BrowserRouter basename={window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'))}>
            <MainComponent />
        </BrowserRouter>
    </Provider>
);

