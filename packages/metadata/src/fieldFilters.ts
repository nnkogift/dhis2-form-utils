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

// Note: `programSection` is deliberately excluded here — it is not a real field on
// `ProgramRuleActionParams` (absent from OpenAPI v43; see `ProgramRuleAction` below, which adds
// it back via a manual type intersection). Including an unrepresentable field in this array
// would make `PickWithFieldFilters`'s recursive picker collapse the *entire* derived type to
// `never` (a comma-separated field that isn't `keyof Model` fails every case in the picker,
// and that `never` propagates through the surrounding intersection chain). The actual query
// sent to the API still requests `programSection[id,displayName]` — see `PROGRAM_RULE_FIELDS`.
export const PROGRAM_RULE_ACTION_FIELDS = [
    'id',
    'programRuleActionType',
    'priority',
    'content',
    'data',
    'location',
    'dataElement[id,displayName,valueType,optionSet[id,options[id,code,displayName]]]',
    'trackedEntityAttribute[id,displayName,valueType]',
    'option',
    'optionGroup',
    'programStageSection[id,displayName]',
] as const;

// Note: `programRuleActions` is deliberately excluded here — on `ProgramRuleParams`, the
// generated type stubs it as `{ id: string }[]` (a flat identifiable reference, not the
// expandable `ProgramRuleActionParams[]`), so requesting nested action fields through this
// array would make `PickWithFieldFilters` collapse the *entire* derived type to `never` (see
// the comment on `PROGRAM_RULE_ACTION_FIELDS` above for the same limitation on `option`).
// `ProgramRule` below adds `programRuleActions` back via a manual type intersection, reusing
// the separately-derived `ProgramRuleAction` type. The actual query string still requests the
// expanded shape — see `PROGRAM_RULE_FIELDS` (string) in `./queries/fields.const.ts`.
export const PROGRAM_RULE_FIELDS = [
    'id',
    'name',
    'displayName',
    'condition',
    'priority',
    'programStage[id]',
] as const;

export const PROGRAM_RULE_VARIABLE_FIELDS = [
    'id',
    'name',
    'valueType',
    'useCodeForOptionSet',
    'programRuleVariableSourceType',
    'programStage[id,displayName]',
    'dataElement[id,displayName,valueType,optionSet[id,options[id,code,displayName]]]',
    'trackedEntityAttribute[id,displayName,valueType]',
] as const;

// Note: `programStageSections` is deliberately excluded here — its real DHIS2 API field name
// for nested data elements is `programStageSectionDataElements`, but `ProgramStageSectionParams`
// (the generated type) stubs that relationship as a flat `dataElements: { id: string }[]`
// instead, under a different key. Requesting the real field name through this array would make
// `PickWithFieldFilters` collapse the *entire* derived type to `never` (same limitation as
// `programRuleActions` and `programSection` above). `ProgramStageMetadata` below adds
// `programStageSections` back via a manual type intersection using the hand-written
// `ProgramStageSection` type. The actual query string still requests the real nested shape —
// see `PROGRAM_STAGE_FIELDS` (string) in `./queries/fields.const.ts`.
export const PROGRAM_STAGE_CORE_FIELDS = [
    'id',
    'displayName',
    'repeatable',
    'sortOrder',
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
    programRuleActions?: ProgramRuleAction[];
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

// Comma-joined query field strings (eventProgramQueryFields, trackerProgramQueryFields,
// programStageQueryFields) previously lived here as monolithic single-query definitions.
// They have been replaced by the decomposed query objects + field constants in
// `./queries/fields.const.ts`, `./queries/eventProgramConfig.query.ts`, and
// `./queries/trackerConfig.query.ts` — see ARCHITECTURE.md › Data Fetching.
