import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { eventProgramConfigQuery } from '@dhis2-form-utils/metadata';

type MockQueryResult = { data: unknown; loading: boolean; error: unknown };

const useDataQueryMock = vi.fn<(...args: unknown[]) => MockQueryResult>();

vi.mock('@dhis2/app-runtime', () => ({
    useDataQuery: (...args: unknown[]) => useDataQueryMock(...args),
}));

describe('useEventProgramMetadataQuery', () => {
    it('passes programId through as the query variables', async () => {
        useDataQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });

        const { useEventProgramMetadataQuery } = await import('./useEventProgramMetadataQuery');
        renderHook(() => useEventProgramMetadataQuery('program1'));

        expect(useDataQueryMock).toHaveBeenCalledWith(eventProgramConfigQuery, {
            variables: { programId: 'program1' },
        });
    });

    it('returns loading state and undefined metadata before data resolves', async () => {
        useDataQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });

        const { useEventProgramMetadataQuery } = await import('./useEventProgramMetadataQuery');
        const { result } = renderHook(() => useEventProgramMetadataQuery('program1'));

        expect(result.current.loading).toBe(true);
        expect(result.current.metadata).toBeUndefined();
        expect(result.current.error).toBeUndefined();
    });

    it('resolves metadata via resolveEventProgramMetadata only when data is present', async () => {
        useDataQueryMock.mockReturnValue({
            data: {
                program: {
                    id: 'program1',
                    displayName: 'Program One',
                    programType: 'WITHOUT_REGISTRATION',
                    programStages: [],
                },
                programRules: { programRules: [] },
                programRuleVariables: { programRuleVariables: [] },
            },
            loading: false,
            error: undefined,
        });

        const { useEventProgramMetadataQuery } = await import('./useEventProgramMetadataQuery');
        const { result } = renderHook(() => useEventProgramMetadataQuery('program1'));

        expect(result.current.loading).toBe(false);
        expect(result.current.metadata).toEqual({
            id: 'program1',
            displayName: 'Program One',
            code: undefined,
            shortName: undefined,
            programType: 'WITHOUT_REGISTRATION',
            programStages: [],
            programRules: [],
            programRuleVariables: [],
            constants: [],
        });
    });

    it('surfaces the error from useDataQuery unchanged', async () => {
        const error = new Error('network error');
        useDataQueryMock.mockReturnValue({ data: undefined, loading: false, error });

        const { useEventProgramMetadataQuery } = await import('./useEventProgramMetadataQuery');
        const { result } = renderHook(() => useEventProgramMetadataQuery('program1'));

        expect(result.current.error).toBe(error);
        expect(result.current.metadata).toBeUndefined();
    });
});
