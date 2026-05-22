/* eslint-disable @typescript-eslint/no-deprecated -- @dhis2/rule-engine Kotlin/JS interop requires these APIs */
import {
    Option,
    RuleActionJs,
    RuleDataValue,
    RuleEffectJs,
    RuleEngineContextJs,
    RuleEngineJs,
    RuleEnrollmentJs,
    RuleEventJs,
    RuleEventStatus,
    RuleInstant,
    RuleJs,
    RuleLocalDate,
    RuleSupplementaryDataJs,
    RuleValueType,
    RuleVariableJs,
    RuleVariableType,
} from '@dhis2/rule-engine';
import {
    Dhis2ValueType,
    ProgramRuleVariableSourceType,
    type ProgramRule,
    type ProgramRuleAction,
    type ProgramRuleVariable,
    type ProgramStageMetadata,
} from '@dhis2-form-utils/metadata';
import type { RuleEffect } from './evaluate';

const DEFAULT_EVENT_STATUS = RuleEventStatus.ACTIVE;
const DEFAULT_ORG_UNIT = 'UNKNOWN_ORG_UNIT';

export type EnrollmentContext = {
    enrollment?: RuleEnrollmentJs | null;
    events?: RuleEventJs[];
};

export type RuleEngineContext = {
    metadata: ProgramStageMetadata;
    context: RuleEngineContextJs | null;
    engine: RuleEngineJs;
};

export type BuiltRuleEngine = {
    evaluate: (currentValues: Record<string, unknown>) => RuleEffect[];
};

const ruleValueTypeFromDhis2 = (valueType?: Dhis2ValueType | string): RuleValueType => {
    switch (valueType) {
        case Dhis2ValueType.NUMBER:
        case Dhis2ValueType.INTEGER:
        case Dhis2ValueType.INTEGER_POSITIVE:
            return RuleValueType.NUMERIC;
        case Dhis2ValueType.BOOLEAN:
            return RuleValueType.BOOLEAN;
        case Dhis2ValueType.DATE:
            return RuleValueType.DATE;
        default:
            return RuleValueType.TEXT;
    }
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

const mapDataElementOptions = (dataElement?: ProgramRuleAction['dataElement']): Option[] =>
    dataElement?.optionSet?.options?.map(
        (option: { id: string; code: string; displayName: string }) =>
            new Option(option.displayName, option.code)
    ) ?? [];

const toStringValue = (value: unknown, fallback: string): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return fallback;
};

const toActionValues = (action: ProgramRuleAction): Map<string, string> => {
    const values = new Map<string, string>();

    if (action.dataElement?.id) values.set('dataElement', action.dataElement.id);
    if (action.trackedEntityAttribute?.id) {
        values.set('trackedEntityAttribute', action.trackedEntityAttribute.id);
    }
    if (action.content) values.set('content', action.content);
    if (action.option?.code) values.set('optionCode', action.option.code);
    if (action.option?.id) values.set('optionId', action.option.id);
    if (action.optionGroup?.id) values.set('optionGroupId', action.optionGroup.id);
    if (action.programStageSection?.id)
        values.set('programStageSection', action.programStageSection.id);
    if (action.programSection?.id) values.set('programSection', action.programSection.id);

    return values;
};

const toRuleAction = (action: ProgramRuleAction): RuleActionJs =>
    new RuleActionJs(
        action.data ?? null,
        action.programRuleActionType,
        toActionValues(action),
        action.priority ?? null
    );

const toRule = (rule: ProgramRule): RuleJs =>
    new RuleJs(
        rule.condition ?? 'true',
        (rule.programRuleActions ?? []).map(toRuleAction),
        rule.id,
        rule.displayName ?? null,
        null,
        rule.priority ?? null
    );

const toRuleVariableField = (variable: ProgramRuleVariable): string =>
    variable.dataElement?.id ?? variable.trackedEntityAttribute?.id ?? variable.name;

const toRuleVariable = (variable: ProgramRuleVariable): RuleVariableJs =>
    new RuleVariableJs(
        variableTypeFromSource(variable.programRuleVariableSourceType),
        variable.name,
        variable.useCodeForOptionSet ?? false,
        mapDataElementOptions(variable.dataElement),
        toRuleVariableField(variable),
        ruleValueTypeFromDhis2(variable.dataElement?.valueType),
        variable.programStage?.id ?? null
    );

const toContext = (metadata: ProgramStageMetadata): RuleEngineContextJs | null => {
    if (!metadata.programRules?.length) {
        return null;
    }

    return new RuleEngineContextJs(
        metadata.programRules.map(toRule),
        (metadata.programRuleVariables ?? []).map(toRuleVariable),
        new RuleSupplementaryDataJs([], [], new Map<string, string[]>()),
        new Map<string, string>()
    );
};

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

const toRuleEvent = (
    metadata: ProgramStageMetadata,
    currentValues: Record<string, unknown>
): RuleEventJs =>
    new RuleEventJs(
        toStringValue(currentValues.event, 'current-event'),
        metadata.id,
        metadata.displayName,
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

const normalizeEffect = (effect: RuleEffectJs): RuleEffect => {
    const values = effect.ruleAction.values;
    return {
        ruleActionType: effect.ruleAction.type,
        content: values.get('content') ?? null,
        dataElement: values.get('dataElement') ?? null,
        trackedEntityAttribute: values.get('trackedEntityAttribute') ?? null,
        optionCode: values.get('optionCode') ?? values.get('option') ?? null,
        optionGroupId: values.get('optionGroupId') ?? values.get('optionGroup') ?? null,
        programStageSection: values.get('programStageSection') ?? null,
        programSection: values.get('programSection') ?? null,
        data: effect.data ?? effect.ruleAction.data ?? null,
    };
};

export function buildRuleEngineContext(metadata: ProgramStageMetadata): RuleEngineContext {
    return {
        metadata,
        context: toContext(metadata),
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
