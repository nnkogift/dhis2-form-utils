import { useDataQuery } from '@dhis2/app-runtime';
import { useMemo } from 'react';
import {
    resolveTrackerProgramMetadata,
    trackerConfigQuery,
    type RawTrackerConfigResult,
    type TrackerProgramMetadata,
} from '@dhis2-form-utils/metadata';

export type UseTrackerMetadataQueryResult = {
    metadata: TrackerProgramMetadata | undefined;
    loading: boolean;
    error: Error | undefined;
};

/**
 * Thin convenience wrapper around `trackerConfigQuery` + `resolveTrackerProgramMetadata`.
 * Optional sugar — `useTrackerForm` never calls this internally and does not fetch on its own.
 * `metadata` is memoized on `data` — `useTrackerForm` relies on a stable `metadata` reference
 * to avoid rebuilding its rule engine on every render.
 */
export function useTrackerMetadataQuery(programId: string): UseTrackerMetadataQueryResult {
    const { data, loading, error } = useDataQuery<RawTrackerConfigResult>(trackerConfigQuery, {
        variables: { programId },
    });
    const metadata = useMemo(
        () => (data ? resolveTrackerProgramMetadata(data) : undefined),
        [data]
    );

    return { metadata, loading, error };
}
