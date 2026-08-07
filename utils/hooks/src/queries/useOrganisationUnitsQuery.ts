import { useDataQuery } from '@dhis2/app-runtime';
import type { UserParams } from '@dhis2/api-types/v43';
import type { PickWithFieldFilters } from '@dhis2/api-types/utils';
import type { Query, QueryVariables } from '@dhis2/data-engine';
import { useEffect, useMemo } from 'react';

/**
 * Cross-checked against `@dhis2/api-types/v43`'s `OrganisationUnitParams`: `id`/`displayName` are
 * real fields there. `ancestors` is a real relation too, but `OrganisationUnitParams` stubs it as a
 * flat `{ id }[]` reference rather than the expandable `{ id, displayName }[]` shape requested below
 * — the same generator limitation documented for `programRuleActions`/`programStageSections` in
 * `packages/metadata/src/fieldFilters.ts` (a field-filter entry naming an unrepresentable relation
 * collapses `PickWithFieldFilters`'s derived type to `never`), so this is hand-typed rather than
 * derived, matching that file's `ProgramStageSection` precedent.
 */
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

const ME_ORG_UNIT_FIELDS = ['organisationUnits[id]'] as const;

/**
 * `me.organisationUnits[].id` is derived from the real `UserParams` schema, so the field exists.
 * What's *not* confirmable from `@dhis2/api-types` is the response envelope — that `me` returns
 * `{ organisationUnits: [...] }` at the query's own alias key, and that `organisationUnits` (plural
 * resource) returns `{ organisationUnits: { organisationUnits: [...] } }` — those are
 * `@dhis2/data-engine` query-shape artifacts, not REST schema facts, and still need live-instance QA.
 */
type RawMeResult = { me?: PickWithFieldFilters<UserParams, typeof ME_ORG_UNIT_FIELDS> };
type RawOrgUnitsResult = { organisationUnits?: { organisationUnits?: OrgUnitNode[] } };

const meQuery: Query = {
    me: {
        resource: 'me',
        params: { fields: ME_ORG_UNIT_FIELDS.join(',') },
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
        () =>
            roots ??
            (meData?.me?.organisationUnits ?? [])
                .map((ou) => ou.id)
                .filter((id): id is string => Boolean(id)),
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
