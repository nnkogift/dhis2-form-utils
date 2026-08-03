import type { Query, QueryVariables } from '@dhis2/data-engine';
import {
    CONSTANT_FIELDS,
    PROGRAM_RULE_FIELDS,
    PROGRAM_RULE_VARIABLE_FIELDS,
    PROGRAM_TEA_FIELDS,
} from './fields.const';

/**
 * Static query for `useTrackerForm` metadata — the program (header + tracked entity attributes),
 * plus program rules and program rule variables as independent top-level resources filtered by
 * `program.id`. Constants are a global (non-program-scoped) resource. See ARCHITECTURE.md ›
 * Data Fetching.
 */
export const trackerConfigQuery: Query = {
    program: {
        resource: 'programs',
        id: (variables: QueryVariables) => variables.programId as string,
        params: {
            fields: PROGRAM_TEA_FIELDS,
        },
    },
    programRules: {
        resource: 'programRules',
        params: (variables: QueryVariables) => ({
            fields: PROGRAM_RULE_FIELDS,
            filter: `program.id:eq:${variables.programId as string}`,
            paging: false,
        }),
    },
    programRuleVariables: {
        resource: 'programRuleVariables',
        params: (variables: QueryVariables) => ({
            fields: PROGRAM_RULE_VARIABLE_FIELDS,
            filter: `program.id:eq:${variables.programId as string}`,
            paging: false,
        }),
    },
    constants: {
        resource: 'constants',
        params: { fields: CONSTANT_FIELDS, paging: false },
    },
};
