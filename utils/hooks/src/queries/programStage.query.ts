import type { Query } from '@dhis2/data-engine';
import { programStageQueryFields } from '@dhis2-form-utils/metadata';

export const programStageQuery = (id: string): Query => ({
    programStage: {
        resource: 'programStages',
        id,
        params: {
            fields: programStageQueryFields,
        },
    },
});
