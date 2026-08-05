/* eslint-disable @typescript-eslint/no-deprecated -- @dhis2/rule-engine Kotlin/JS interop requires these APIs */
import {
    RuleAttributeValue,
    RuleEngineContextJs,
    RuleEngineJs,
    RuleEnrollmentJs,
    RuleEnrollmentStatus,
    RuleEventJs,
    RuleJs,
    RuleLocalDate,
    RuleVariableJs,
    RuleVariableType,
} from '@dhis2/rule-engine';
import {
    ProgramRuleActionType,
    ProgramRuleVariableSourceType,
    type ProgramRuleAction,
    type TrackerProgramMetadata,
} from '@nnkogift/dhis2-form-utils-metadata';
import type { BuiltRuleEngine, RuleSupplementaryDataInput } from './context';
import { toRuleSupplementaryData } from './context';
import { normalizeEffect, toRuleAction, toStringValue } from './ruleInterop';
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
    if (
        action.programRuleActionType === ProgramRuleActionType.ASSIGN &&
        action.trackedEntityAttribute?.id
    ) {
        values.set('field', action.trackedEntityAttribute.id);
    }
    if (action.programStageSection?.id) {
        values.set('programStageSection', action.programStageSection.id);
    }
    if (action.programSection?.id) values.set('programSection', action.programSection.id);
    if (action.location) values.set('location', action.location);

    return values;
};

const toEnrollmentRule = (rule: TrackerProgramMetadata['programRules'][number]): RuleJs =>
    new RuleJs(
        rule.condition ?? 'true',
        rule.programRuleActions.map((action) =>
            toRuleAction(action as ProgramRuleAction, toActionValues(action as ProgramRuleAction))
        ),
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

const toEnrollmentContext = (
    metadata: TrackerProgramMetadata,
    supplementaryData?: RuleSupplementaryDataInput
): RuleEngineContextJs | null => {
    const enrollmentRules = metadata.programRules.filter((rule) => !rule.programStage?.id);
    if (!enrollmentRules.length) {
        return null;
    }

    const ruleVariables = metadata.programRuleVariables
        .filter((variable) =>
            ENROLLMENT_VARIABLE_SOURCES.has(variable.programRuleVariableSourceType)
        )
        .map(toEnrollmentRuleVariable);

    const constantsMap = new Map(
        (Array.isArray(metadata.constants) ? metadata.constants : []).flatMap((c) =>
            c.id ? [[c.id, String(c.value)] as const] : []
        )
    );

    return new RuleEngineContextJs(
        enrollmentRules.map(toEnrollmentRule),
        ruleVariables,
        toRuleSupplementaryData(supplementaryData),
        constantsMap
    );
};

const teaUidsFromMetadata = (metadata: TrackerProgramMetadata): Set<string> =>
    new Set(
        metadata.programTrackedEntityAttributes
            .map((programTea) => programTea.trackedEntityAttribute.id)
            .filter((id): id is string => Boolean(id))
    );

export const toRuleEnrollment = (
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

export function buildEnrollmentRuleEngineContext(
    metadata: TrackerProgramMetadata,
    supplementaryData?: RuleSupplementaryDataInput
): EnrollmentRuleEngineContext {
    return {
        metadata,
        context: toEnrollmentContext(metadata, supplementaryData),
        engine: new RuleEngineJs(),
    };
}

export function buildEnrollmentRuleEngine(
    context: EnrollmentRuleEngineContext,
    ruleEvents: RuleEventJs[] = []
): BuiltRuleEngine {
    return {
        evaluate(currentValues) {
            if (!context.context) {
                return [];
            }

            const enrollment = toRuleEnrollment(context.metadata, currentValues);
            const effects = context.engine.evaluateEnrollment(
                enrollment,
                ruleEvents,
                context.context
            );

            return effects.map(normalizeEffect);
        },
    };
}
