import { useDataQuery } from '@dhis2/app-runtime'
import { useEffect, useMemo } from 'react'
import {
    extractReferencedOptionGroupIds,
    optionGroupsQuery,
    resolveOptionGroups,
    type OptionGroupCodeMap,
    type ProgramRule,
    type RawOptionGroupsResult,
} from '@nnkogift/dhis2-form-utils-metadata'

/**
 * Resolves the optionGroup ids referenced by `HIDEOPTIONGROUP`/`SHOWOPTIONGROUP` rule actions
 * into concrete option codes, shaped for `useEventForm`/`useTrackerForm`'s `optionGroups` option.
 *
 * `useDataQuery`'s `variables`/`lazy` options are only read on the hook's initial render — since
 * `programRules` (and therefore `optionGroupIds`) is empty on first render and only becomes
 * populated once program metadata finishes loading, the query is always mounted lazily and
 * re-triggered via `refetch` once there are ids to resolve.
 */
export function useOptionGroupsSupplementaryData(
    programRules: ProgramRule[]
): OptionGroupCodeMap | undefined {
    const optionGroupIds = useMemo(
        () => extractReferencedOptionGroupIds(programRules),
        [programRules]
    )

    const { data, refetch } = useDataQuery<RawOptionGroupsResult>(
        optionGroupsQuery,
        {
            lazy: true,
        }
    )

    useEffect(() => {
        if (optionGroupIds.length > 0) {
            refetch({ optionGroupIds })
        }
    }, [optionGroupIds, refetch])

    return useMemo(() => (data ? resolveOptionGroups(data) : undefined), [data])
}
