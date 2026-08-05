import { useDataQuery } from '@dhis2/app-runtime';
import { useMemo } from 'react';
import {
    eventProgramConfigQuery,
    resolveEventProgramMetadata,
    type EventProgramMetadata,
    type RawEventProgramConfigResult,
} from '@nnkogift/dhis2-form-utils-metadata';

export type UseEventProgramMetadataQueryResult = {
    metadata: EventProgramMetadata | undefined;
    loading: boolean;
    error: Error | undefined;
};

/**
 * Thin convenience wrapper around `eventProgramConfigQuery` + `resolveEventProgramMetadata`.
 * Optional sugar — `useEventForm` never calls this internally and does not fetch on its own.
 * `metadata` is memoized on `data` — `useEventForm` relies on a stable `metadata` reference
 * to avoid rebuilding its rule engine on every render.
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
    const metadata = useMemo(() => (data ? resolveEventProgramMetadata(data) : undefined), [data]);

    return { metadata, loading, error };
}
