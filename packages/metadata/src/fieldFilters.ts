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

export const PROGRAM_STAGE_SECTION_DATA_ELEMENT_FIELDS = [
    'sortOrder',
    'dataElement[id,displayName,displayFormName,valueType,description,optionSet[id,options[id,code,displayName]]]',
] as const;

export const PROGRAM_STAGE_SECTION_FIELDS = [
    'id',
    'displayName',
    'sortOrder',
    'renderType',
    'programStageSectionDataElements[sortOrder,dataElement[id,displayName,displayFormName,valueType,description,optionSet[id,options[id,code,displayName]]]]',
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
    'programSection[id,displayName]',
] as const;

export const PROGRAM_RULE_FIELDS = [
    'id',
    'displayName',
    'condition',
    'priority',
    'programStage[id]',
    'programRuleActions[programRuleActionType,priority,content,data,location,dataElement[id,displayName,valueType,optionSet[id,options[id,code,displayName]]],trackedEntityAttribute[id,displayName,valueType],option[id,code,displayName],optionGroup[id,displayName],programStageSection[id,displayName],programSection[id,displayName]]',
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

const PROGRAM_STAGE_SECTIONS_QUERY_FIELD = `programStageSections[${PROGRAM_STAGE_SECTION_FIELDS.join(',')}]`;

export const PROGRAM_STAGE_CORE_FIELDS = [
    'id',
    'displayName',
    'programStageDataElements[id,compulsory,allowProvidedElsewhere,allowFutureDate,displayInReports,renderType,dataElement[id,displayName,displayFormName,valueType,description,optionSet[id,options[id,code,displayName]]]]',
    PROGRAM_STAGE_SECTIONS_QUERY_FIELD,
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

export type ProgramStageSectionDataElement = {
    sortOrder?: number;
    dataElement?: DataElementRef;
};

export type ProgramStageSection = {
    id: string;
    displayName?: string;
    sortOrder?: number;
    renderType?: { type?: string };
    programStageSectionDataElements?: ProgramStageSectionDataElement[];
};

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

export type ProgramRule = PickWithFieldFilters<ProgramRuleParams, typeof PROGRAM_RULE_FIELDS> & {
    programStage?: { id: string };
};

export type ProgramRuleVariable = PickWithFieldFilters<
    ProgramRuleVariableParams,
    typeof PROGRAM_RULE_VARIABLE_FIELDS
>;

type ProgramStageCore = PickWithFieldFilters<ProgramStageParams, typeof PROGRAM_STAGE_CORE_FIELDS>;

/** Program stage metadata for forms — data elements and optional section layout. */
export type ProgramStageMetadata = ProgramStageCore & {
    programStageSections?: ProgramStageSection[];
};

export type TrackedEntityAttributeRef = PickWithFieldFilters<
    TrackedEntityAttributeParams,
    typeof TRACKED_ENTITY_ATTRIBUTE_REF_FIELDS
>;

export type ProgramTrackedEntityAttribute = PickWithFieldFilters<
    ProgramTrackedEntityAttributeParams,
    typeof PROGRAM_TRACKED_ENTITY_ATTRIBUTE_FIELDS
>;

/** Program-level metadata for event forms — rules live on the program, not the stage. */
export type EventProgramMetadata = {
    id: string;
    displayName: string;
    code?: string;
    shortName?: string;
    programType: string;
    programStages: ProgramStageMetadata[];
    programRules: ProgramRule[];
    programRuleVariables: ProgramRuleVariable[];
};

const PROGRAM_RULES_QUERY_FIELD =
    'programRules[id,displayName,condition,priority,programStage[id],programRuleActions[programRuleActionType,priority,content,data,location,dataElement[id,displayName,valueType,optionSet[options[id,code,displayName]]],trackedEntityAttribute[id,displayName,valueType],option[id,code,displayName],optionGroup[id,displayName],programStageSection[id,displayName],programSection[id,displayName]]]';

const PROGRAM_RULE_VARIABLES_QUERY_FIELD =
    'programRuleVariables[id,name,useCodeForOptionSet,programRuleVariableSourceType,programStage[id,displayName],dataElement[id,displayName,valueType,optionSet[options[id,code,displayName]]],trackedEntityAttribute[id,displayName,valueType]]';

const EVENT_PROGRAM_HEADER_FIELDS = [
    'id',
    'displayName',
    'code',
    'shortName',
    'programType',
] as const;

const EVENT_PROGRAM_STAGES_QUERY_FIELD = `programStages[${PROGRAM_STAGE_CORE_FIELDS.join(',')}]`;

/** Comma-joined field string for programs API query (event form metadata). */
export const eventProgramQueryFields = [
    ...EVENT_PROGRAM_HEADER_FIELDS,
    EVENT_PROGRAM_STAGES_QUERY_FIELD,
    PROGRAM_RULES_QUERY_FIELD,
    PROGRAM_RULE_VARIABLES_QUERY_FIELD,
].join(',');

/** Comma-joined field string for programStages API query (stage PSDEs/sections only, no rules). */
export const programStageQueryFields = PROGRAM_STAGE_CORE_FIELDS.join(',');

const TRACKER_PROGRAM_HEADER_FIELDS = [
    'id',
    'displayName',
    'trackedEntityType[id]',
    'displayIncidentDate',
    'selectEnrollmentDatesInFuture',
    'selectIncidentDatesInFuture',
    'enrollmentDateLabel',
    'incidentDateLabel',
] as const;

const TRACKER_PROGRAM_TRACKED_ENTITY_ATTRIBUTES_QUERY_FIELD =
    'programTrackedEntityAttributes[id,mandatory,allowFutureDate,searchable,displayInList,sortOrder,renderType,renderOptionsAsRadio,trackedEntityAttribute[id,displayName,formName,valueType,optionSet[id,options[id,code,displayName]],unique,generated,fieldMask,confidential,orgunitScope]]';

/**
 * Enrollment-scoped rule action fields — dataElement is excluded (enrollment rules target TEAs,
 * not data elements); programSection is included for HIDESECTION support (absent from OpenAPI v43).
 */
const ENROLLMENT_RULE_ACTION_FIELDS =
    'id,programRuleActionType,data,content,location,trackedEntityAttribute[id],programStageSection[id],programSection[id]';

const ENROLLMENT_PROGRAM_RULES_QUERY_FIELD = `programRules[id,name,condition,priority,programStage[id],programRuleActions[${ENROLLMENT_RULE_ACTION_FIELDS}]]`;

const ENROLLMENT_PROGRAM_RULE_VARIABLES_QUERY_FIELD =
    'programRuleVariables[id,name,useCodeForOptionSet,programRuleVariableSourceType,valueType,programStage[id],trackedEntityAttribute[id]]';

const PROGRAM_SECTIONS_QUERY_FIELD =
    'programSections[id,displayName,sortOrder,trackedEntityAttributes[id]]';

/** Comma-joined field string for programs API query (tracker registration form metadata). */
export const trackerProgramQueryFields = [
    ...TRACKER_PROGRAM_HEADER_FIELDS,
    TRACKER_PROGRAM_TRACKED_ENTITY_ATTRIBUTES_QUERY_FIELD,
    ENROLLMENT_PROGRAM_RULES_QUERY_FIELD,
    ENROLLMENT_PROGRAM_RULE_VARIABLES_QUERY_FIELD,
    PROGRAM_SECTIONS_QUERY_FIELD,
].join(',');
