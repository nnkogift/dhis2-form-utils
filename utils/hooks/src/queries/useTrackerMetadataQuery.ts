import { useDataQuery } from '@dhis2/app-runtime';
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
 */
export function useTrackerMetadataQuery(programId: string): UseTrackerMetadataQueryResult {
    const { data, loading, error } = useDataQuery<RawTrackerConfigResult>(trackerConfigQuery, {
        variables: { programId },
    });

    return {
        metadata: data ? resolveTrackerProgramMetadata(data) : undefined,
        loading,
        error,
    };
}
