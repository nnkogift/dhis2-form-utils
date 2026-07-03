import { useDataQuery } from '@dhis2/app-runtime'
import { useMemo } from 'react'
import type { OrgUnit } from '@/types/program'

type MeWithOrgUnits = {
    organisationUnits?: OrgUnit[]
    dataViewOrganisationUnits?: OrgUnit[]
    teiSearchOrganisationUnits?: OrgUnit[]
}

type AccessibleOrgUnitsQueryResult = {
    me: MeWithOrgUnits
}

const ME_ORG_UNIT_FIELDS = [
    'organisationUnits[id,displayName]',
    'dataViewOrganisationUnits[id,displayName]',
    'teiSearchOrganisationUnits[id,displayName]',
].join(',')

function dedupeOrgUnits(orgUnits: OrgUnit[]): OrgUnit[] {
    const byId = new Map<string, OrgUnit>()

    for (const orgUnit of orgUnits) {
        if (!orgUnit.id) {
            continue
        }
        byId.set(orgUnit.id, orgUnit)
    }

    return [...byId.values()].sort((left, right) =>
        left.displayName.localeCompare(right.displayName)
    )
}

export function useAccessibleOrgUnits() {
    const query = useMemo(
        () => ({
            me: {
                resource: 'me',
                params: {
                    fields: ME_ORG_UNIT_FIELDS,
                },
            },
        }),
        []
    )

    const queryResult = useDataQuery<AccessibleOrgUnitsQueryResult>(query)
    const me = queryResult.data?.me
    const orgUnits = dedupeOrgUnits([
        ...(me?.teiSearchOrganisationUnits ?? []),
        ...(me?.dataViewOrganisationUnits ?? []),
        ...(me?.organisationUnits ?? []),
    ])

    return {
        ...queryResult,
        orgUnits,
    }
}
