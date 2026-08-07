import { useDataQuery } from '@dhis2/app-runtime';
import type { Query, QueryVariables } from '@dhis2/data-engine';
import { useEffect, useMemo } from 'react';

export type OrgUnitNode = {
    id: string;
    displayName: string;
    ancestors: Array<{ id: string; displayName: string }>;
};

export type UseOrganisationUnitsQueryResult = {
    organisationUnits: OrgUnitNode[];
    /** Root org unit ids actually used — explicit `roots`, or resolved from `me` when omitted. */
    roots: string[];
    loading: boolean;
    error: Error | undefined;
};

// Nested fields are optional despite the DHIS2 API contract guaranteeing them — an unmatched
// mock (Storybook/tests) or an unexpected server response can still omit them at runtime.
type RawMeResult = { me?: { organisationUnits?: Array<{ id: string }> } };
type RawOrgUnitsResult = { organisationUnits?: { organisationUnits?: OrgUnitNode[] } };

const meQuery: Query = {
    me: {
        resource: 'me',
        params: { fields: 'organisationUnits[id]' },
    },
};

const organisationUnitsQuery: Query = {
    organisationUnits: {
        resource: 'organisationUnits',
        params: (variables: QueryVariables) => ({
            fields: 'id,displayName,ancestors[id,displayName]',
            filter: (variables.roots as string[]).map((id) => `path:like:${id}`),
            rootJunction: 'OR',
            paging: false,
        }),
    },
};

/**
 * Default org-unit data source used by `D2OrgUnitField` widgets when no
 * `OrgUnitPickerProvider` ancestor supplies `roots`. Falls back to the
 * logged-in user's data-capture organisation units when `roots` is omitted.
 *
 * The `me`/`organisationUnits` response shapes and the `path:like:` filter
 * used here were not verified against a live DHIS2 instance during
 * implementation — confirm during QA before relying on this in production.
 */
export function useOrganisationUnitsQuery(roots?: string[]): UseOrganisationUnitsQueryResult {
    const hasExplicitRoots = Boolean(roots && roots.length > 0);

    const {
        data: meData,
        loading: meLoading,
        error: meError,
    } = useDataQuery<RawMeResult>(meQuery, { lazy: hasExplicitRoots });

    const effectiveRoots = useMemo(
        () => roots ?? meData?.me?.organisationUnits?.map((ou) => ou.id) ?? [],
        [roots, meData]
    );

    const {
        data: ouData,
        loading: ouLoading,
        error: ouError,
        refetch: refetchOrgUnits,
    } = useDataQuery<RawOrgUnitsResult>(organisationUnitsQuery, { lazy: true });

    useEffect(() => {
        if (effectiveRoots.length > 0) {
            void refetchOrgUnits({ roots: effectiveRoots });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [effectiveRoots.join(',')]);

    const organisationUnits = useMemo(
        () => ouData?.organisationUnits?.organisationUnits ?? [],
        [ouData]
    );

    return {
        organisationUnits,
        roots: effectiveRoots,
        loading: (hasExplicitRoots ? false : meLoading) || ouLoading,
        error: meError ?? ouError,
    };
}
