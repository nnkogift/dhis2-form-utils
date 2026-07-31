import type { Query } from '@dhis2/data-engine';
import { eventProgramQueryFields } from '@dhis2-form-utils/metadata';

export const eventProgramQuery = (id: string): Query => ({
    program: {
        resource: 'programs',
        id,
        params: {
            fields: eventProgramQueryFields,
        },
    },
});
