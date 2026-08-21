import type { Query, QueryVariables } from '@dhis2/data-engine';

export type ProgramRuleActionDetail = {
    id: string;
    programRuleActionType: string;
    priority?: number;
    content?: string;
    data?: string;
    location?: string;
    dataElement?: { id: string; displayName?: string };
    trackedEntityAttribute?: { id: string; displayName?: string };
    option?: { id: string; displayName?: string };
    optionGroup?: { id: string; displayName?: string };
    programStageSection?: { id: string; displayName?: string };
    programStage?: { id: string; displayName?: string };
    programSection?: { id: string; displayName?: string };
};

export type ProgramRuleDetail = {
    id: string;
    name?: string;
    displayName?: string;
    code?: string;
    description?: string;
    condition?: string;
    priority?: number;
    lastUpdated?: string;
    lastUpdatedBy?: { displayName?: string };
    program?: { id: string; displayName?: string };
    programStage?: { id: string; displayName?: string };
    programRuleActions?: ProgramRuleActionDetail[];
};

export type ProgramRuleDetailQueryResult = {
    programRule: ProgramRuleDetail;
};

const PROGRAM_RULE_ACTION_DETAIL_FIELDS = [
    'id',
    'programRuleActionType',
    'priority',
    'content',
    'data',
    'location',
    'dataElement[id,displayName]',
    'trackedEntityAttribute[id,displayName]',
    'option[id,displayName]',
    'optionGroup[id,displayName]',
    'programStageSection[id,displayName]',
    'programStage[id,displayName]',
    'programSection[id,displayName]',
].join(',');

/** `programRules/{id}` fields for the rule details modal — richer than the catalog list query. */
const PROGRAM_RULE_DETAIL_FIELDS: string = [
    'id',
    'name',
    'displayName',
    'code',
    'description',
    'condition',
    'priority',
    'lastUpdated',
    'lastUpdatedBy[displayName]',
    'program[id,displayName]',
    'programStage[id,displayName]',
    `programRuleActions[${PROGRAM_RULE_ACTION_DETAIL_FIELDS}]`,
].join(',');

/**
 * Fetches a single program rule (with actions expanded) by id — used lazily by the rule
 * details modal so the catalog list query stays lightweight. See `useProgramRuleDetail`.
 */
export const programRuleDetailQuery: Query = {
    programRule: {
        resource: 'programRules',
        id: (variables: QueryVariables) => variables.ruleId as string,
        params: {
            fields: PROGRAM_RULE_DETAIL_FIELDS,
        },
    },
};
