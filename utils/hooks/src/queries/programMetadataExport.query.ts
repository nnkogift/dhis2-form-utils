import type { Query } from '@dhis2/data-engine';

/** Fetches program metadata export (`GET /api/programs/{id}/metadata`). */
export const programMetadataExportQuery = (programId: string): Query => ({
    programMetadata: {
        resource: 'programs',
        id: `${programId}/metadata`,
        params: {
            skipSharing: true,
        },
    },
});
