import { useDataQuery } from '@dhis2/app-runtime'
import { useMemo } from 'react'
import type { RuleSupplementaryDataInput } from '@dhis2-form-utils/rules'

const SUPPLEMENTARY_DATA_FIELDS = ['userGroups[id]', 'userRoles[id]'].join(',')

const meQuery = {
    me: {
        resource: 'me',
        params: { fields: SUPPLEMENTARY_DATA_FIELDS },
    },
}

type MeResult = {
    me: {
        userGroups?: Array<{ id: string }>
        userRoles?: Array<{ id: string }>
    }
}

/**
 * Current user's groups/roles, shaped for `useEventForm`/`useTrackerForm`'s `supplementaryData` option.
 * Memoized on `data` — an unstable reference here would make those hooks reinit their rule engine every render.
 */
export function useCurrentUserSupplementaryData():
    | RuleSupplementaryDataInput
    | undefined {
    const { data } = useDataQuery<MeResult>(meQuery)

    return useMemo(() => {
        if (!data) {
            return undefined
        }

        return {
            userGroups: data.me.userGroups?.map((group) => group.id) ?? [],
            userRoles: data.me.userRoles?.map((role) => role.id) ?? [],
        }
    }, [data])
}
