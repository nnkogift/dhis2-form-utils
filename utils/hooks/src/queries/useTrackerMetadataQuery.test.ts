import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { trackerConfigQuery } from '@nnkogift/dhis2-form-utils-metadata';

type MockQueryResult = { data: unknown; loading: boolean; error: unknown };

const useDataQueryMock = vi.fn<(...args: unknown[]) => MockQueryResult>();

vi.mock('@dhis2/app-runtime', () => ({
    useDataQuery: (...args: unknown[]) => useDataQueryMock(...args),
}));

describe('useTrackerMetadataQuery', () => {
    it('passes programId through as the query variables', async () => {
        useDataQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });

        const { useTrackerMetadataQuery } = await import('./useTrackerMetadataQuery');
        renderHook(() => useTrackerMetadataQuery('program1'));

        expect(useDataQueryMock).toHaveBeenCalledWith(trackerConfigQuery, {
            variables: { programId: 'program1' },
        });
    });

    it('returns loading state and undefined metadata before data resolves', async () => {
        useDataQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });

        const { useTrackerMetadataQuery } = await import('./useTrackerMetadataQuery');
        const { result } = renderHook(() => useTrackerMetadataQuery('program1'));

        expect(result.current.loading).toBe(true);
        expect(result.current.metadata).toBeUndefined();
        expect(result.current.error).toBeUndefined();
    });

    it('resolves metadata via resolveTrackerProgramMetadata only when data is present', async () => {
        useDataQueryMock.mockReturnValue({
            data: {
                program: {
                    id: 'program1',
                    displayName: 'Program One',
                    trackedEntityType: { id: 'tet1' },
                    programTrackedEntityAttributes: [],
                },
                programRules: { programRules: [] },
                programRuleVariables: { programRuleVariables: [] },
            },
            loading: false,
            error: undefined,
        });

        const { useTrackerMetadataQuery } = await import('./useTrackerMetadataQuery');
        const { result } = renderHook(() => useTrackerMetadataQuery('program1'));

        expect(result.current.loading).toBe(false);
        expect(result.current.metadata?.id).toBe('program1');
        expect(result.current.metadata?.trackedEntityType).toEqual({ id: 'tet1' });
        expect(result.current.metadata?.programRules).toEqual([]);
    });

    it('surfaces the error from useDataQuery unchanged', async () => {
        const error = new Error('network error');
        useDataQueryMock.mockReturnValue({ data: undefined, loading: false, error });

        const { useTrackerMetadataQuery } = await import('./useTrackerMetadataQuery');
        const { result } = renderHook(() => useTrackerMetadataQuery('program1'));

        expect(result.current.error).toBe(error);
        expect(result.current.metadata).toBeUndefined();
    });
});
