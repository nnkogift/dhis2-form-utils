import { ProgramRuleActionType } from '@nnkogift/dhis2-form-utils-metadata';
import type { RuleEffect } from '@nnkogift/dhis2-form-utils-rules';

export type TraceEffect = {
    type: ProgramRuleActionType;
    targetId: string;
    data?: string | null;
};

export type RuleTraceEntry = {
    id: string;
    timestamp: number;
    changedFields: string[];
    ruleResults: Array<{
        ruleId: string;
        effects: TraceEffect[];
    }>;
};

const FIELD_SCOPED_TYPES = new Set<string>([
    ProgramRuleActionType.HIDEFIELD,
    ProgramRuleActionType.SHOWFIELD,
    ProgramRuleActionType.SHOWWARNING,
    ProgramRuleActionType.SHOWERROR,
    ProgramRuleActionType.WARNINGONCOMPLETE,
    ProgramRuleActionType.ERRORONCOMPLETE,
    ProgramRuleActionType.ASSIGN,
    ProgramRuleActionType.SETMANDATORYFIELD,
    ProgramRuleActionType.UNSETMANDATORYFIELD,
    ProgramRuleActionType.HIDEOPTION,
    ProgramRuleActionType.HIDEOPTIONGROUP,
    ProgramRuleActionType.SHOWOPTION,
    ProgramRuleActionType.SHOWOPTIONGROUP,
]);

const resolveTargetId = (effect: RuleEffect): string | null => {
    if (FIELD_SCOPED_TYPES.has(effect.ruleActionType)) {
        return effect.dataElement ?? effect.trackedEntityAttribute ?? null;
    }

    if (effect.ruleActionType === ProgramRuleActionType.HIDESECTION) {
        return effect.programStageSection ?? effect.programSection ?? null;
    }

    if (
        effect.ruleActionType === ProgramRuleActionType.DISPLAYTEXT ||
        effect.ruleActionType === ProgramRuleActionType.DISPLAYKEYVALUEPAIR
    ) {
        const location = effect.location === 'indicators' ? 'indicators' : 'feedback';
        return `${location}:${effect.content ?? ''}`;
    }

    if (effect.location) {
        return effect.location;
    }

    return null;
};

export function buildTraceEntry(
    changedFields: string[],
    effects: RuleEffect[],
    id?: string,
    timestamp?: number
): RuleTraceEntry {
    const byRule = new Map<string, TraceEffect[]>();

    for (const effect of effects) {
        const targetId = resolveTargetId(effect);
        if (!targetId) {
            continue;
        }

        const list = byRule.get(effect.ruleId) ?? [];
        list.push({
            type: effect.ruleActionType,
            targetId,
            data: effect.data ?? null,
        });
        byRule.set(effect.ruleId, list);
    }

    return {
        id: id ?? crypto.randomUUID(),
        timestamp: timestamp ?? Date.now(),
        changedFields,
        ruleResults: [...byRule.entries()].map(([ruleId, ruleEffects]) => ({
            ruleId,
            effects: ruleEffects,
        })),
    };
}
