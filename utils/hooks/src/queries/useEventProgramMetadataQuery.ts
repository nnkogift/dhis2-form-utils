import { useDataQuery } from '@dhis2/app-runtime';
import {
    eventProgramConfigQuery,
    resolveEventProgramMetadata,
    type EventProgramMetadata,
    type RawEventProgramConfigResult,
} from '@dhis2-form-utils/metadata';

export type UseEventProgramMetadataQueryResult = {
    metadata: EventProgramMetadata | undefined;
    loading: boolean;
    error: Error | undefined;
};

/**
 * Thin convenience wrapper around `eventProgramConfigQuery` + `resolveEventProgramMetadata`.
 * Optional sugar — `useEventForm` never calls this internally and does not fetch on its own.
 */
export function useEventProgramMetadataQuery(
    programId: string
): UseEventProgramMetadataQueryResult {
    const { data, loading, error } = useDataQuery<RawEventProgramConfigResult>(
        eventProgramConfigQuery,
        {
            variables: { programId },
        }
    );

    return {
        metadata: data ? resolveEventProgramMetadata(data) : undefined,
        loading,
        error,
    };
}
