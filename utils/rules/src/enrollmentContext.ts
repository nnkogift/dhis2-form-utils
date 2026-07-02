/* eslint-disable @typescript-eslint/no-deprecated -- @dhis2/rule-engine Kotlin/JS interop requires these APIs */
import {
    RuleActionJs,
    RuleAttributeValue,
    RuleEffectJs,
    RuleEngineContextJs,
    RuleEngineJs,
    RuleEnrollmentJs,
    RuleEnrollmentStatus,
    RuleJs,
    RuleLocalDate,
    RuleSupplementaryDataJs,
    RuleVariableJs,
    RuleVariableType,
} from '@dhis2/rule-engine';
import {
    ProgramRuleVariableSourceType,
    type ProgramRuleAction,
    type TrackerProgramMetadata,
} from '@dhis2-form-utils/metadata';
import type { BuiltRuleEngine } from './context';
import type { RuleEffect } from './evaluate';
import { ProgramRuleActionType } from '@dhis2/api-types';
import { ruleValueTypeFromDhis2 } from './ruleValueType';

const DEFAULT_ENROLLMENT_ID = 'current-enrollment';

export type EnrollmentRuleEngineContext = {
    metadata: TrackerProgramMetadata;
    context: RuleEngineContextJs | null;
    engine: RuleEngineJs;
};

const ENROLLMENT_VARIABLE_SOURCES = new Set<string>([
    ProgramRuleVariableSourceType.TEI_ATTRIBUTE,
    ProgramRuleVariableSourceType.CALCULATED_VALUE,
]);

const toStringValue = (value: unknown, fallback: string): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return fallback;
};

const toRuleDate = (value: unknown, fallback: string): RuleLocalDate => {
    if (typeof value === 'string' && value) {
        try {
            return RuleLocalDate.parse(value);
        } catch {
            return RuleLocalDate.parse(fallback);
        }
    }
    return RuleLocalDate.parse(fallback);
};

const toActionValues = (action: ProgramRuleAction): Map<string, string> => {
    const values = new Map<string, string>();

    if (action.trackedEntityAttribute?.id) {
        values.set('trackedEntityAttribute', action.trackedEntityAttribute.id);
    }
    if (action.content) values.set('content', action.content);
    if (action.programStageSection?.id) {
        values.set('programStageSection', action.programStageSection.id);
    }
    if (action.programSection?.id) values.set('programSection', action.programSection.id);
    if (action.location) values.set('location', action.location);

    return values;
};

const toRuleAction = (action: ProgramRuleAction): RuleActionJs =>
    new RuleActionJs(
        action.data ?? null,
        action.programRuleActionType,
        toActionValues(action),
        action.priority ?? null
    );

const toEnrollmentRule = (rule: TrackerProgramMetadata['programRules'][number]): RuleJs =>
    new RuleJs(
        rule.condition ?? 'true',
        rule.programRuleActions.map((action) => toRuleAction(action as ProgramRuleAction)),
        rule.id ?? '',
        rule.name ?? null,
        null,
        rule.priority ?? null
    );

const toEnrollmentRuleVariable = (
    variable: TrackerProgramMetadata['programRuleVariables'][number]
): RuleVariableJs => {
    const sourceType = variable.programRuleVariableSourceType;

    if (sourceType === ProgramRuleVariableSourceType.TEI_ATTRIBUTE) {
        return new RuleVariableJs(
            RuleVariableType.TEI_ATTRIBUTE,
            variable.name ?? '',
            variable.useCodeForOptionSet ?? false,
            [],
            variable.trackedEntityAttribute?.id ?? '',
            ruleValueTypeFromDhis2(variable.valueType),
            null
        );
    }

    return new RuleVariableJs(
        RuleVariableType.CALCULATED_VALUE,
        variable.name ?? '',
        false,
        [],
        '',
        ruleValueTypeFromDhis2(variable.valueType),
        null
    );
};

const toEnrollmentContext = (metadata: TrackerProgramMetadata): RuleEngineContextJs | null => {
    const enrollmentRules = metadata.programRules.filter((rule) => !rule.programStage?.id);
    if (!enrollmentRules.length) {
        return null;
    }

    const ruleVariables = metadata.programRuleVariables
        .filter((variable) =>
            ENROLLMENT_VARIABLE_SOURCES.has(variable.programRuleVariableSourceType)
        )
        .map(toEnrollmentRuleVariable);

    return new RuleEngineContextJs(
        enrollmentRules.map(toEnrollmentRule),
        ruleVariables,
        new RuleSupplementaryDataJs([], [], new Map<string, string[]>()),
        new Map<string, string>()
    );
};

const teaUidsFromMetadata = (metadata: TrackerProgramMetadata): Set<string> =>
    new Set(
        metadata.programTrackedEntityAttributes
            .map((programTea) => programTea.trackedEntityAttribute.id)
            .filter((id): id is string => Boolean(id))
    );

const toRuleEnrollment = (
    metadata: TrackerProgramMetadata,
    currentValues: Record<string, unknown>
): RuleEnrollmentJs => {
    const teaUids = teaUidsFromMetadata(metadata);
    const enrolledAt = toStringValue(currentValues.enrolledAt, '2000-01-01');
    const occurredAt = metadata.displayIncidentDate
        ? toStringValue(currentValues.occurredAt, enrolledAt)
        : enrolledAt;

    const attributeValues = Object.entries(currentValues)
        .filter(([key]) => teaUids.has(key))
        .map(([trackedEntityAttribute, value]) => {
            const stringValue = toStringValue(value, '');
            if (!stringValue) {
                return null;
            }
            return new RuleAttributeValue(trackedEntityAttribute, stringValue);
        })
        .filter((value): value is RuleAttributeValue => value !== null);

    return new RuleEnrollmentJs(
        DEFAULT_ENROLLMENT_ID,
        metadata.displayName,
        toRuleDate(occurredAt, enrolledAt),
        toRuleDate(enrolledAt, '2000-01-01'),
        RuleEnrollmentStatus.ACTIVE,
        toStringValue(currentValues.orgUnit, 'UNKNOWN_ORG_UNIT'),
        null,
        attributeValues
    );
};

const normalizeEffect = (effect: RuleEffectJs): RuleEffect => {
    const values = effect.ruleAction.values;
    return {
        ruleActionType: effect.ruleAction.type as ProgramRuleActionType,
        content: values.get('content') ?? null,
        dataElement: values.get('dataElement') ?? null,
        trackedEntityAttribute: values.get('trackedEntityAttribute') ?? null,
        optionCode: values.get('optionCode') ?? values.get('option') ?? null,
        optionGroupId: values.get('optionGroupId') ?? values.get('optionGroup') ?? null,
        programStageSection: values.get('programStageSection') ?? null,
        programSection: values.get('programSection') ?? null,
        location: values.get('location') ?? null,
        data: effect.data ?? effect.ruleAction.data ?? null,
    };
};

export function buildEnrollmentRuleEngineContext(
    metadata: TrackerProgramMetadata
): EnrollmentRuleEngineContext {
    return {
        metadata,
        context: toEnrollmentContext(metadata),
        engine: new RuleEngineJs(),
    };
}

export function buildEnrollmentRuleEngine(context: EnrollmentRuleEngineContext): BuiltRuleEngine {
    return {
        evaluate(currentValues) {
            if (!context.context) {
                return [];
            }

            const enrollment = toRuleEnrollment(context.metadata, currentValues);
            const effects = context.engine.evaluateEnrollment(enrollment, [], context.context);

            return effects.map(normalizeEffect);
        },
    };
}
