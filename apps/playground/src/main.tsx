import { Provider } from '@dhis2/app-runtime';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const config = {
    baseUrl: 'https://debug.dhis2.org',
    apiVersion: 41,
};

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
    <StrictMode>
        <Provider
            config={config}
            userInfo={undefined}
            plugin={false}
            parentAlertsAdd={undefined}
            showAlertsInPlugin={false}
        >
            <App />
        </Provider>
    </StrictMode>
);
