import type { Query } from '@dhis2/data-engine';
import { trackerProgramQueryFields } from '@dhis2-form-utils/metadata';

export const trackerProgramQuery = (id: string): Query => ({
    program: {
        resource: 'programs',
        id,
        params: {
            fields: trackerProgramQueryFields,
        },
    },
});
