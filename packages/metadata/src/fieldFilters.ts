import type {
    DataElementParams,
    ProgramRuleActionParams,
    ProgramRuleParams,
    ProgramRuleVariableParams,
    ProgramStageDataElementParams,
    ProgramStageParams,
    ProgramTrackedEntityAttributeParams,
    TrackedEntityAttributeParams,
    ValueType,
} from '@dhis2/api-types/v43';
import type { PickWithFieldFilters } from '@dhis2/api-types/utils';

export type { ValueType };

export const DATA_ELEMENT_REF_FIELDS = [
    'id',
    'displayName',
    'displayFormName',
    'valueType',
    'description',
    'optionSet[id,options[id,code,displayName]]',
] as const;

export const PROGRAM_STAGE_DATA_ELEMENT_FIELDS = [
    'id',
    'compulsory',
    'allowProvidedElsewhere',
    'allowFutureDate',
    'displayInReports',
    'renderType',
    'dataElement[id,displayName,displayFormName,valueType,description,optionSet[id,options[id,code,displayName]]]',
] as const;

export const PROGRAM_RULE_ACTION_FIELDS = [
    'programRuleActionType',
    'priority',
    'content',
    'data',
    'location',
    'dataElement[id,displayName,valueType,optionSet[id,options[id,code,displayName]]]',
    'trackedEntityAttribute[id,displayName,valueType]',
    'option[id,code,displayName]',
    'optionGroup[id,displayName]',
    'programStageSection[id,displayName]',
] as const;

export const PROGRAM_RULE_FIELDS = [
    'id',
    'displayName',
    'condition',
    'priority',
    'programRuleActions[programRuleActionType,priority,content,data,location,dataElement[id,displayName,valueType,optionSet[id,options[id,code,displayName]]],trackedEntityAttribute[id,displayName,valueType],option[id,code,displayName],optionGroup[id,displayName],programStageSection[id,displayName]]',
] as const;

export const PROGRAM_RULE_VARIABLE_FIELDS = [
    'id',
    'name',
    'useCodeForOptionSet',
    'programRuleVariableSourceType',
    'programStage[id,displayName]',
    'dataElement[id,displayName,valueType,optionSet[id,options[id,code,displayName]]]',
    'trackedEntityAttribute[id,displayName,valueType]',
] as const;

export const PROGRAM_STAGE_CORE_FIELDS = [
    'id',
    'displayName',
    'programStageDataElements[id,compulsory,allowProvidedElsewhere,allowFutureDate,displayInReports,renderType,dataElement[id,displayName,displayFormName,valueType,description,optionSet[id,options[id,code,displayName]]]]',
] as const;

export const TRACKED_ENTITY_ATTRIBUTE_REF_FIELDS = [
    'id',
    'displayName',
    'displayFormName',
    'valueType',
    'description',
    'unique',
    'generated',
    'pattern',
    'optionSet[id,options[id,code,displayName]]',
] as const;

export const PROGRAM_TRACKED_ENTITY_ATTRIBUTE_FIELDS = [
    'id',
    'mandatory',
    'displayInList',
    'allowFutureDate',
    'searchable',
    'renderType',
    'trackedEntityAttribute[id,displayName,displayFormName,valueType,description,unique,generated,pattern,optionSet[id,options[id,code,displayName]]]',
] as const;

export type DataElementRef = PickWithFieldFilters<
    DataElementParams,
    typeof DATA_ELEMENT_REF_FIELDS
>;

export type ProgramStageDataElement = PickWithFieldFilters<
    ProgramStageDataElementParams,
    typeof PROGRAM_STAGE_DATA_ELEMENT_FIELDS
>;

type ApiProgramRuleAction = PickWithFieldFilters<
    ProgramRuleActionParams,
    typeof PROGRAM_RULE_ACTION_FIELDS
>;

/** Extended with programSection — used by rule engine but absent from OpenAPI v43. */
export type ProgramRuleAction = ApiProgramRuleAction & {
    programSection?: {
        id: string;
        displayName?: string;
    };
};

export type ProgramRule = PickWithFieldFilters<ProgramRuleParams, typeof PROGRAM_RULE_FIELDS>;

export type ProgramRuleVariable = PickWithFieldFilters<
    ProgramRuleVariableParams,
    typeof PROGRAM_RULE_VARIABLE_FIELDS
>;

type ProgramStageCore = PickWithFieldFilters<ProgramStageParams, typeof PROGRAM_STAGE_CORE_FIELDS>;

/**
 * Program stage metadata for forms. `programRules` and `programRuleVariables` are
 * field-filterable on the API but not modelled on ProgramStageParams in OpenAPI v43.
 */
export type ProgramStageMetadata = ProgramStageCore & {
    programRules?: ProgramRule[];
    programRuleVariables?: ProgramRuleVariable[];
};

export type TrackedEntityAttributeRef = PickWithFieldFilters<
    TrackedEntityAttributeParams,
    typeof TRACKED_ENTITY_ATTRIBUTE_REF_FIELDS
>;

export type ProgramTrackedEntityAttribute = PickWithFieldFilters<
    ProgramTrackedEntityAttributeParams,
    typeof PROGRAM_TRACKED_ENTITY_ATTRIBUTE_FIELDS
>;

const PROGRAM_RULES_QUERY_FIELD =
    'programRules[id,displayName,condition,priority,programRuleActions[programRuleActionType,priority,content,data,location,dataElement[id,displayName,valueType,optionSet[options[id,code,displayName]]],trackedEntityAttribute[id,displayName,valueType],option[id,code,displayName],optionGroup[id,displayName],programStageSection[id,displayName]]]';

const PROGRAM_RULE_VARIABLES_QUERY_FIELD =
    'programRuleVariables[id,name,useCodeForOptionSet,programRuleVariableSourceType,programStage[id,displayName],dataElement[id,displayName,valueType,optionSet[options[id,code,displayName]]],trackedEntityAttribute[id,displayName,valueType]]';

/** Comma-joined field string for programStages API query. */
export const programStageQueryFields = [
    ...PROGRAM_STAGE_CORE_FIELDS,
    PROGRAM_RULES_QUERY_FIELD,
    PROGRAM_RULE_VARIABLES_QUERY_FIELD,
].join(',');
