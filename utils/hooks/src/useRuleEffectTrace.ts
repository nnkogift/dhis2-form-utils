import { useMemo, useRef, useSyncExternalStore } from 'react';
import type { ProgramRuleActionType } from '@dhis2-form-utils/metadata';
import type { RuleTraceEntry } from './buildTraceEntry';
import { useFormStore } from './FormStateContext';

export type RuleEffectTrace = {
    ruleId: string;
    ruleActionType: ProgramRuleActionType;
};

function useLatestTraceEntry(): RuleTraceEntry | null {
    const formStore = useFormStore();
    const entryRef = useRef<RuleTraceEntry | null>(null);

    return useSyncExternalStore(
        (onStoreChange) =>
            formStore.subscribeTrace((entry) => {
                entryRef.current = entry;
                onStoreChange();
            }),
        () => entryRef.current,
        () => entryRef.current
    );
}

function useRuleEffectIndex(): ReadonlyMap<string, RuleEffectTrace> {
    const entry = useLatestTraceEntry();

    return useMemo(() => {
        const index = new Map<string, RuleEffectTrace>();
        if (!entry) {
            return index;
        }

        for (const result of entry.ruleResults) {
            for (const effect of result.effects) {
                // Last effect wins if multiple rules target the same field/section
                // in one evaluation cycle — callers only surface a single badge per target.
                index.set(effect.targetId, {
                    ruleId: result.ruleId,
                    ruleActionType: effect.type,
                });
            }
        }

        return index;
    }, [entry]);
}

/** The rule (and action type) that most recently produced an effect on `targetId` — a field id, section id, or `<location>:<content>` feedback key. */
export function useRuleEffectTrace(targetId: string): RuleEffectTrace | null {
    return useRuleEffectIndex().get(targetId) ?? null;
}

export function useFieldRuleEffect(fieldId: string): RuleEffectTrace | null {
    return useRuleEffectTrace(fieldId);
}

export function useSectionRuleEffect(sectionId: string): RuleEffectTrace | null {
    return useRuleEffectTrace(sectionId);
}
