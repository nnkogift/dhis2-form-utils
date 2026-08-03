import type { Query, QueryVariables } from '@dhis2/data-engine';

/** `optionGroups` resource fields — group id + member option codes. */
export const OPTION_GROUP_FIELDS = 'id,options[id,code]';

/**
 * Static query for resolving `HIDEOPTIONGROUP`/`SHOWOPTIONGROUP` rule-action targets into
 * concrete option codes. Callers should scope `variables.optionGroupIds` to the ids returned
 * by `extractReferencedOptionGroupIds` — fetching only the groups actually referenced by a
 * program's rules.
 */
export const optionGroupsQuery: Query = {
    optionGroups: {
        resource: 'optionGroups',
        params: (variables: QueryVariables) => ({
            fields: OPTION_GROUP_FIELDS,
            filter: `id:in:[${(variables.optionGroupIds as string[]).join(',')}]`,
            paging: false,
        }),
    },
};
