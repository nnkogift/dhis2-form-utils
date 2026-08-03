import { http, HttpResponse } from 'msw';

export const mswHandlers = {
    dhis2: [http.get('https://debug.dhis2.org/api/*', () => HttpResponse.json({ status: 'ok' }))],
};
