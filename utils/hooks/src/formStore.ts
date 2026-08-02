import { debounce, type DebouncedFunc } from 'lodash-es';
import type { RefObject } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { BuiltRuleEngine, EffectHandlersMap, RuleEffect } from '@dhis2-form-utils/rules';
import { buildTraceEntry, type RuleTraceEntry } from './buildTraceEntry';
import { evaluateFormState } from './evaluateFormState';
import { createFieldStateStore, type FieldStateStore } from './store/fieldStateStore';
import { createNonFieldStateStore, type NonFieldStateStore } from './store/nonFieldStateStore';

const DEBOUNCE_MS = 40;

type TraceListener = (entry: RuleTraceEntry) => void;

export class FormStore {
    readonly fieldStore: FieldStateStore = createFieldStateStore();
    readonly nonFieldStore: NonFieldStateStore = createNonFieldStateStore();

    private unsubscribe: (() => void) | null = null;
    private debouncedEvaluate: DebouncedFunc<() => void> | null = null;
    private prevAssignments: Record<string, unknown> = {};
    private engine: BuiltRuleEngine | null = null;
    private form: UseFormReturn<Record<string, unknown>> | null = null;
    private effectHandlersRef: RefObject<EffectHandlersMap | undefined> | null = null;
    private pendingChangedFields = new Set<string>();
    private traceListeners = new Set<TraceListener>();
    private lastTraceEntry: RuleTraceEntry | null = null;

    subscribeTrace(listener: TraceListener): () => void {
        this.traceListeners.add(listener);
        if (this.lastTraceEntry) {
            listener(this.lastTraceEntry);
        }
        return () => {
            this.traceListeners.delete(listener);
        };
    }

    init(
        form: UseFormReturn<Record<string, unknown>>,
        engine: BuiltRuleEngine,
        effectHandlersRef: RefObject<EffectHandlersMap | undefined>
    ): void {
        if (
            this.form === form &&
            this.engine === engine &&
            this.effectHandlersRef === effectHandlersRef &&
            this.unsubscribe
        ) {
            return;
        }

        this.destroy();

        this.form = form;
        this.engine = engine;
        this.effectHandlersRef = effectHandlersRef;

        const evaluate = (changedFields: string[]) => {
            if (!this.engine || !this.form) return;

            const next = evaluateFormState(
                this.engine,
                this.form.getValues(),
                this.effectHandlersRef?.current ?? undefined
            );

            this.applyAssignments(next.fieldMap);
            this.fieldStore.setState(next.fieldMap);
            this.nonFieldStore.setState(next.sectionMap, next.feedback);
            this.maybeEmitTrace(changedFields, next.effects);
        };

        this.debouncedEvaluate = debounce(() => {
            const changedFields = [...this.pendingChangedFields];
            this.pendingChangedFields.clear();
            evaluate(changedFields);
        }, DEBOUNCE_MS);

        evaluate([]);

        this.unsubscribe = form.subscribe({
            formState: { values: true },
            callback: ({ name }) => {
                if (name) {
                    this.pendingChangedFields.add(name);
                }
                this.debouncedEvaluate?.();
            },
        });
    }

    reinit(
        form: UseFormReturn<Record<string, unknown>>,
        engine: BuiltRuleEngine,
        effectHandlersRef: RefObject<EffectHandlersMap | undefined>
    ): void {
        this.destroy();
        this.init(form, engine, effectHandlersRef);
    }

    destroy(): void {
        this.debouncedEvaluate?.cancel();
        this.debouncedEvaluate = null;
        this.unsubscribe?.();
        this.unsubscribe = null;
        this.form = null;
        this.engine = null;
        this.effectHandlersRef = null;
        this.prevAssignments = {};
        this.pendingChangedFields.clear();
        this.lastTraceEntry = null;
    }

    private maybeEmitTrace(changedFields: string[], effects: RuleEffect[]): void {
        const entry = buildTraceEntry(changedFields, effects);
        this.lastTraceEntry = entry;

        if (this.traceListeners.size === 0) {
            return;
        }

        for (const listener of this.traceListeners) {
            listener(entry);
        }
    }

    private applyAssignments(
        fieldMap: Record<string, { assignedValue: unknown }> | undefined
    ): void {
        if (!this.form || !fieldMap) return;

        const pending: Array<{ fieldId: string; value: unknown }> = [];

        for (const [fieldId, state] of Object.entries(fieldMap)) {
            if (state.assignedValue === null || state.assignedValue === undefined) {
                continue;
            }

            if (this.prevAssignments[fieldId] === state.assignedValue) {
                continue;
            }

            pending.push({ fieldId, value: state.assignedValue });
        }

        if (!pending.length) return;

        for (const { fieldId, value } of pending) {
            this.prevAssignments[fieldId] = value;
            this.form.setValue(fieldId, value, {
                shouldDirty: false,
                shouldTouch: false,
                shouldValidate: false,
            });
        }
    }
}
