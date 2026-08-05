/* eslint-disable @typescript-eslint/no-deprecated -- @dhis2/rule-engine Kotlin/JS interop requires these APIs */
import {
    Option,
    RuleDataValue,
    RuleEngineContextJs,
    RuleEngineJs,
    RuleEnrollmentJs,
    RuleEventJs,
    RuleEventStatus,
    RuleInstant,
    RuleJs,
    RuleLocalDate,
    RuleSupplementaryDataJs,
    RuleVariableJs,
    RuleVariableType,
} from '@dhis2/rule-engine';
import {
    ProgramRuleActionType,
    ProgramRuleVariableSourceType,
    type ProgramConstant,
    type ProgramRule,
    type ProgramRuleAction,
    type ProgramRuleVariable,
    type ProgramStageMetadata,
} from '@nnkogift/dhis2-form-utils-metadata';
import type { RuleEffect } from './evaluate';
import { normalizeEffect, toRuleAction, toStringValue } from './ruleInterop';
import { ruleValueTypeFromDhis2 } from './ruleValueType';

const DEFAULT_EVENT_STATUS = RuleEventStatus.ACTIVE;
const DEFAULT_ORG_UNIT = 'UNKNOWN_ORG_UNIT';

export type EnrollmentContext = {
    enrollment?: RuleEnrollmentJs | null;
    events?: RuleEventJs[];
};

export type RuleSupplementaryDataInput = {
    userGroups?: string[];
    userRoles?: string[];
    orgUnitGroups?: Record<string, string[]>;
};

export type RuleEventStatusInput =
    | 'ACTIVE'
    | 'COMPLETED'
    | 'SCHEDULE'
    | 'SKIPPED'
    | 'VISITED'
    | 'OVERDUE';

export type RuleEventInput = {
    event: string;
    programStage: string;
    /** Caller supplies directly — avoids a metadata lookup in the converter. */
    programStageName?: string;
    /** Defaults to 'ACTIVE'. */
    status?: RuleEventStatusInput;
    eventDate?: string | null;
    dueDate?: string | null;
    completedDate?: string | null;
    /** ISO instant string; defaults to RuleInstant.now(). */
    createdDate?: string;
    createdAtClientDate?: string | null;
    orgUnit?: string;
    orgUnitCode?: string | null;
    dataValues?: Record<string, unknown>;
};

export type RuleEngineContext = {
    metadata: ProgramStageMetadata;
    context: RuleEngineContextJs | null;
    engine: RuleEngineJs;
};

export type BuiltRuleEngine = {
    evaluate: (currentValues: Record<string, unknown>) => RuleEffect[];
};

const variableTypeFromSource = (
    sourceType: ProgramRuleVariableSourceType | undefined
): RuleVariableType => {
    switch (sourceType) {
        case ProgramRuleVariableSourceType.DATAELEMENT_CURRENT_EVENT:
            return RuleVariableType.DATAELEMENT_CURRENT_EVENT;
        case ProgramRuleVariableSourceType.DATAELEMENT_NEWEST_EVENT_PROGRAM:
            return RuleVariableType.DATAELEMENT_NEWEST_EVENT_PROGRAM;
        case ProgramRuleVariableSourceType.DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE:
            return RuleVariableType.DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE;
        case ProgramRuleVariableSourceType.DATAELEMENT_PREVIOUS_EVENT:
            return RuleVariableType.DATAELEMENT_PREVIOUS_EVENT;
        case ProgramRuleVariableSourceType.TEI_ATTRIBUTE:
            return RuleVariableType.TEI_ATTRIBUTE;
        case ProgramRuleVariableSourceType.CALCULATED_VALUE:
        default:
            return RuleVariableType.CALCULATED_VALUE;
    }
};

type OptionRef = { id?: string; code?: string; displayName?: string };
type DataElementWithOptions = { optionSet?: { options?: OptionRef[] } };

const mapDataElementOptions = (dataElement?: DataElementWithOptions): Option[] =>
    dataElement?.optionSet?.options?.map((option) => {
        const displayName = option.displayName ?? option.code ?? '';
        const code = option.code ?? '';
        return new Option(displayName, code);
    }) ?? [];

const toActionValues = (action: ProgramRuleAction): Map<string, string> => {
    const values = new Map<string, string>();

    if (action.dataElement?.id) values.set('dataElement', action.dataElement.id);
    if (action.trackedEntityAttribute?.id) {
        values.set('trackedEntityAttribute', action.trackedEntityAttribute.id);
    }
    if (action.content) values.set('content', action.content);
    if (action.programRuleActionType === ProgramRuleActionType.ASSIGN) {
        const field = action.dataElement?.id ?? action.trackedEntityAttribute?.id;
        if (field) values.set('field', field);
    }
    const option = action.option as OptionRef | undefined;
    const optionGroup = action.optionGroup as { id?: string; displayName?: string } | undefined;
    if (option?.code) values.set('optionCode', option.code);
    if (option?.id) values.set('optionId', option.id);
    if (optionGroup?.id) values.set('optionGroupId', optionGroup.id);
    if (action.programStageSection?.id)
        values.set('programStageSection', action.programStageSection.id);
    if (action.programSection?.id) values.set('programSection', action.programSection.id);
    if (action.location) values.set('location', action.location);

    return values;
};

const toRule = (rule: ProgramRule): RuleJs =>
    new RuleJs(
        rule.condition ?? 'true',
        (rule.programRuleActions ?? []).map((action) =>
            toRuleAction(action, toActionValues(action))
        ),
        rule.id ?? '',
        rule.displayName ?? null,
        null,
        rule.priority ?? null
    );

const toRuleVariableField = (variable: ProgramRuleVariable): string =>
    variable.dataElement?.id ?? variable.trackedEntityAttribute?.id ?? variable.name ?? '';

const toRuleVariable = (variable: ProgramRuleVariable): RuleVariableJs =>
    new RuleVariableJs(
        variableTypeFromSource(variable.programRuleVariableSourceType),
        variable.name ?? '',
        variable.useCodeForOptionSet ?? false,
        mapDataElementOptions(variable.dataElement),
        toRuleVariableField(variable),
        ruleValueTypeFromDhis2(variable.dataElement?.valueType),
        variable.programStage?.id ?? null
    );

const toContext = (
    programRules: ProgramRule[],
    programRuleVariables: ProgramRuleVariable[],
    constants: ProgramConstant[] = [],
    supplementaryData?: RuleSupplementaryDataInput
): RuleEngineContextJs | null => {
    if (!programRules.length) {
        return null;
    }

    const constantsMap = new Map(
        constants.flatMap((c) => (c.id ? [[c.id, String(c.value)] as const] : []))
    );

    return new RuleEngineContextJs(
        programRules.map(toRule),
        programRuleVariables.map(toRuleVariable),
        toRuleSupplementaryData(supplementaryData),
        constantsMap
    );
};

export type BuildRuleEngineContextOptions = {
    stageMetadata: ProgramStageMetadata;
    programRules: ProgramRule[];
    programRuleVariables: ProgramRuleVariable[];
    programStageId: string;
    constants?: ProgramConstant[];
    supplementaryData?: RuleSupplementaryDataInput;
};

const filterEventRules = (rules: ProgramRule[], programStageId: string): ProgramRule[] =>
    rules.filter((rule) => !rule.programStage?.id || rule.programStage.id === programStageId);

const filterEventRuleVariables = (
    variables: ProgramRuleVariable[],
    programStageId: string
): ProgramRuleVariable[] =>
    variables.filter(
        (variable) => !variable.programStage?.id || variable.programStage.id === programStageId
    );

const toRuleDataValue = (id: string, value: unknown): RuleDataValue | null => {
    if (value === undefined || value === null) {
        return null;
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return new RuleDataValue(id, String(value));
    }

    return null;
};

const toRuleDate = (value: unknown): RuleLocalDate | null => {
    if (!value || typeof value !== 'string') {
        return null;
    }

    try {
        return RuleLocalDate.parse(value);
    } catch {
        return null;
    }
};

const EVENT_STATUS_MAP: Record<RuleEventStatusInput, RuleEventStatus> = {
    ACTIVE: RuleEventStatus.ACTIVE,
    COMPLETED: RuleEventStatus.COMPLETED,
    SCHEDULE: RuleEventStatus.SCHEDULE,
    SKIPPED: RuleEventStatus.SKIPPED,
    VISITED: RuleEventStatus.VISITED,
    OVERDUE: RuleEventStatus.OVERDUE,
};

const toRuleInstant = (value: string | undefined): RuleInstant => {
    if (!value) return RuleInstant.now();
    try {
        return RuleInstant.parse(value);
    } catch {
        return RuleInstant.now();
    }
};

const toNullableRuleInstant = (value: string | null | undefined): RuleInstant | null => {
    if (!value) return null;
    try {
        return RuleInstant.parse(value);
    } catch {
        return null;
    }
};

export const toRuleSupplementaryData = (
    input?: RuleSupplementaryDataInput
): RuleSupplementaryDataJs =>
    new RuleSupplementaryDataJs(
        input?.userGroups ?? [],
        input?.userRoles ?? [],
        new Map(Object.entries(input?.orgUnitGroups ?? {}))
    );

export const toRuleEventFromInput = (input: RuleEventInput): RuleEventJs =>
    new RuleEventJs(
        input.event,
        input.programStage,
        input.programStageName ?? '',
        EVENT_STATUS_MAP[input.status ?? 'ACTIVE'],
        toRuleDate(input.eventDate ?? null),
        toRuleInstant(input.createdDate),
        toNullableRuleInstant(input.createdAtClientDate),
        toRuleDate(input.dueDate ?? null),
        toRuleDate(input.completedDate ?? null),
        input.orgUnit ?? DEFAULT_ORG_UNIT,
        input.orgUnitCode ?? null,
        Object.entries(input.dataValues ?? {})
            .map(([key, value]) => toRuleDataValue(key, value))
            .filter((value): value is RuleDataValue => value !== null)
    );

const toRuleEvent = (
    metadata: ProgramStageMetadata,
    currentValues: Record<string, unknown>
): RuleEventJs =>
    new RuleEventJs(
        toStringValue(currentValues.event, 'current-event'),
        metadata.id ?? '',
        metadata.displayName ?? '',
        DEFAULT_EVENT_STATUS,
        toRuleDate(currentValues.eventDate),
        RuleInstant.now(),
        null,
        toRuleDate(currentValues.dueDate),
        null,
        toStringValue(currentValues.orgUnit, DEFAULT_ORG_UNIT),
        null,
        Object.entries(currentValues)
            .map(([key, value]) => toRuleDataValue(key, value))
            .filter((value): value is RuleDataValue => value !== null)
    );

export function buildRuleEngineContext(options: BuildRuleEngineContextOptions): RuleEngineContext {
    const eventRules = filterEventRules(options.programRules, options.programStageId);
    const eventVariables = filterEventRuleVariables(
        options.programRuleVariables,
        options.programStageId
    );

    return {
        metadata: options.stageMetadata,
        context: toContext(
            eventRules,
            eventVariables,
            options.constants,
            options.supplementaryData
        ),
        engine: new RuleEngineJs(),
    };
}

export function buildRuleEngine(
    context: RuleEngineContext,
    enrollmentContext?: EnrollmentContext
): BuiltRuleEngine {
    return {
        evaluate(currentValues) {
            if (!context.context) {
                return [];
            }

            const targetEvent = toRuleEvent(context.metadata, currentValues);
            const effects = context.engine.evaluateEvent(
                targetEvent,
                enrollmentContext?.enrollment ?? null,
                enrollmentContext?.events ?? [],
                context.context
            );

            return effects.map(normalizeEffect);
        },
    };
}
