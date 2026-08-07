import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

type MockQueryResult = {
    data: unknown;
    loading: boolean;
    error: unknown;
    refetch: (variables?: unknown) => void;
};

const useDataQueryMock = vi.fn<(...args: unknown[]) => MockQueryResult>();

vi.mock('@dhis2/app-runtime', () => ({
    useDataQuery: (...args: unknown[]) => useDataQueryMock(...args),
}));

describe('useOrganisationUnitsQuery', () => {
    it('fetches the user org units first when no roots are given, then refetches scoped org units', async () => {
        const refetchOrgUnits = vi.fn();
        useDataQueryMock
            .mockReturnValueOnce({
                data: { me: { organisationUnits: [{ id: 'ou-root-1' }] } },
                loading: false,
                error: undefined,
                refetch: vi.fn(),
            })
            .mockReturnValueOnce({
                data: undefined,
                loading: false,
                error: undefined,
                refetch: refetchOrgUnits,
            });

        const { useOrganisationUnitsQuery } = await import('./useOrganisationUnitsQuery');
        renderHook(() => useOrganisationUnitsQuery());

        await waitFor(() => {
            expect(refetchOrgUnits).toHaveBeenCalledWith({ roots: ['ou-root-1'] });
        });
    });

    it('does not throw when the me query has not resolved yet and no roots are given', async () => {
        useDataQueryMock
            .mockReturnValueOnce({
                data: undefined,
                loading: true,
                error: undefined,
                refetch: vi.fn(),
            })
            .mockReturnValueOnce({
                data: undefined,
                loading: false,
                error: undefined,
                refetch: vi.fn(),
            });

        const { useOrganisationUnitsQuery } = await import('./useOrganisationUnitsQuery');
        const { result } = renderHook(() => useOrganisationUnitsQuery());

        expect(result.current.organisationUnits).toEqual([]);
        expect(result.current.roots).toEqual([]);
    });

    it('refetches immediately using explicit roots, skipping the me query', async () => {
        const refetchOrgUnits = vi.fn();
        useDataQueryMock
            .mockReturnValueOnce({
                data: undefined,
                loading: false,
                error: undefined,
                refetch: vi.fn(),
            })
            .mockReturnValueOnce({
                data: undefined,
                loading: false,
                error: undefined,
                refetch: refetchOrgUnits,
            });

        const { useOrganisationUnitsQuery } = await import('./useOrganisationUnitsQuery');
        renderHook(() => useOrganisationUnitsQuery(['ou-a', 'ou-b']));

        await waitFor(() => {
            expect(refetchOrgUnits).toHaveBeenCalledWith({ roots: ['ou-a', 'ou-b'] });
        });
    });

    it('maps organisationUnits data through', async () => {
        const orgUnits = [{ id: 'ou-1', displayName: 'Facility A', ancestors: [] }];
        useDataQueryMock
            .mockReturnValueOnce({
                data: undefined,
                loading: false,
                error: undefined,
                refetch: vi.fn(),
            })
            .mockReturnValueOnce({
                data: { organisationUnits: { organisationUnits: orgUnits } },
                loading: false,
                error: undefined,
                refetch: vi.fn(),
            });

        const { useOrganisationUnitsQuery } = await import('./useOrganisationUnitsQuery');
        const { result } = renderHook(() => useOrganisationUnitsQuery(['ou-1']));

        expect(result.current.organisationUnits).toEqual(orgUnits);
    });

    it('surfaces errors from either query', async () => {
        const error = new Error('network error');
        useDataQueryMock
            .mockReturnValueOnce({ data: undefined, loading: false, error, refetch: vi.fn() })
            .mockReturnValueOnce({
                data: undefined,
                loading: false,
                error: undefined,
                refetch: vi.fn(),
            });

        const { useOrganisationUnitsQuery } = await import('./useOrganisationUnitsQuery');
        const { result } = renderHook(() => useOrganisationUnitsQuery());

        expect(result.current.error).toBe(error);
    });
});
