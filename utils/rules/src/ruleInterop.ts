/* eslint-disable @typescript-eslint/no-deprecated -- @dhis2/rule-engine Kotlin/JS interop requires these APIs */
import { RuleActionJs, RuleEffectJs } from '@dhis2/rule-engine';
import type { ProgramRuleActionType } from '@dhis2-form-utils/metadata';
import type { RuleEffect } from './evaluate';

export const toStringValue = (value: unknown, fallback: string): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return fallback;
};

export const toRuleAction = (
    action: {
        data?: string | null;
        programRuleActionType: ProgramRuleActionType;
        priority?: number | null;
    },
    values: Map<string, string>
): RuleActionJs =>
    new RuleActionJs(
        action.data ?? null,
        action.programRuleActionType,
        values,
        action.priority ?? null
    );

export const normalizeEffect = (effect: RuleEffectJs): RuleEffect => {
    const values = effect.ruleAction.values;
    return {
        ruleId: effect.ruleId,
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
