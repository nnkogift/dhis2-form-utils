import {
    PROGRAM_RULE_FIELDS as PROGRAM_RULE_FIELD_LIST,
    PROGRAM_RULE_VARIABLE_FIELDS as PROGRAM_RULE_VARIABLE_FIELD_LIST,
    PROGRAM_STAGE_CORE_FIELDS,
} from '../fieldFilters';

// Requested with its real DHIS2 API field name (`programStageSectionDataElements`), which
// `ProgramStageSectionParams` cannot express (see the comment on `PROGRAM_STAGE_CORE_FIELDS` in
// fieldFilters.ts) — consumers read this via the hand-written `ProgramStageSection` type.
const PROGRAM_STAGE_SECTIONS_FIELD =
    'programStageSections[id,displayName,sortOrder,renderType,programStageSectionDataElements[sortOrder,dataElement[id,displayName,displayFormName,valueType,description,optionSet[id,options[id,code,displayName]]]]]';

/** Nested field-selector for a single program stage — same shape `buildSchema` and `useFieldControl` expect. */
export const PROGRAM_STAGE_FIELDS: string = [
    ...PROGRAM_STAGE_CORE_FIELDS,
    PROGRAM_STAGE_SECTIONS_FIELD,
].join(',');

const EVENT_PROGRAM_HEADER_FIELDS = [
    'id',
    'displayName',
    'code',
    'shortName',
    'programType',
] as const;

/** Full `programs/{id}` query fields for event forms — header + nested program stages. */
export const EVENT_PROGRAM_FIELDS: string = [
    ...EVENT_PROGRAM_HEADER_FIELDS,
    `programStages[${PROGRAM_STAGE_FIELDS}]`,
].join(',');

const PROGRAM_TRACKED_ENTITY_ATTRIBUTES_FIELD =
    'programTrackedEntityAttributes[id,mandatory,allowFutureDate,searchable,displayInList,sortOrder,renderType,renderOptionsAsRadio,trackedEntityAttribute[id,displayName,formName,valueType,optionSet[id,options[id,code,displayName]],unique,generated,fieldMask,confidential,orgunitScope]]';

const PROGRAM_SECTIONS_FIELD =
    'programSections[id,displayName,sortOrder,trackedEntityAttributes[id]]';

const TRACKER_PROGRAM_HEADER_FIELDS = [
    'id',
    'displayName',
    'trackedEntityType[id]',
    'displayIncidentDate',
    'selectEnrollmentDatesInFuture',
    'selectIncidentDatesInFuture',
    'displayEnrollmentDateLabel',
    'displayIncidentDateLabel',
] as const;

/** Full `programs/{id}` query fields for tracker registration forms. */
export const PROGRAM_TEA_FIELDS: string = [
    ...TRACKER_PROGRAM_HEADER_FIELDS,
    PROGRAM_TRACKED_ENTITY_ATTRIBUTES_FIELD,
    PROGRAM_SECTIONS_FIELD,
].join(',');

// `dataElement`/`trackedEntityAttribute`/`option`/`optionGroup`/`programStageSection` are
// requested with their full nested shape here — richer than `ProgramRuleAction`'s derived type,
// since `ProgramRuleActionParams` can only express `option`/`optionGroup` as flat `{id}` refs
// (see the comment on `PROGRAM_RULE_ACTION_FIELDS` in fieldFilters.ts). DHIS2 still returns the
// deeper fields at runtime; consumers that need them (e.g. `option.code`) read them via a cast,
// same as the existing `@dhis2-form-utils/rules` context builders do.
// `programSection` is requested even though it is absent from OpenAPI v43 — DHIS2 simply omits
// it on versions where the field doesn't exist.
const PROGRAM_RULE_ACTIONS_FIELD =
    'programRuleActions[id,programRuleActionType,priority,content,data,location,dataElement[id,displayName,valueType,optionSet[id,options[id,code,displayName]]],trackedEntityAttribute[id,displayName,valueType],option[id,code,displayName],optionGroup[id,displayName],programStageSection[id,displayName],programSection[id,displayName]]';

/**
 * `programRules` resource fields — independent top-level resource, filtered by `program.id`.
 * Shared by event and tracker queries: includes both `dataElement` and `trackedEntityAttribute`
 * action targets since a single program's rules may target either, depending on rule scope.
 */
export const PROGRAM_RULE_FIELDS: string = [
    ...PROGRAM_RULE_FIELD_LIST,
    PROGRAM_RULE_ACTIONS_FIELD,
].join(',');

/**
 * `programRuleVariables` resource fields — independent top-level resource, filtered by
 * `program.id`. Superset used by both `useEventForm` (DATAELEMENT_* sources) and
 * `useTrackerForm` (TEI_ATTRIBUTE / CALCULATED_VALUE sources).
 */
export const PROGRAM_RULE_VARIABLE_FIELDS: string = PROGRAM_RULE_VARIABLE_FIELD_LIST.join(',');

/** Appends extra field selectors to a base `fields=` query string, for query composition. */
export const withExtraFields = (base: string, extra?: string[]): string =>
    extra?.length ? `${base},${extra.join(',')}` : base;
