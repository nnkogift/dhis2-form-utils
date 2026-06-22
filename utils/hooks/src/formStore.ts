import { debounce, type DebouncedFunc } from 'lodash-es';
import type { RefObject } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { BuiltRuleEngine, EffectHandlersMap } from '@dhis2-form-utils/rules';
import { evaluateFormState } from './evaluateFormState';
import { createFieldStateStore, type FieldStateStore } from './store/fieldStateStore';
import { createNonFieldStateStore, type NonFieldStateStore } from './store/nonFieldStateStore';

const DEBOUNCE_MS = 40;

export class FormStore {
    readonly fieldStore: FieldStateStore = createFieldStateStore();
    readonly nonFieldStore: NonFieldStateStore = createNonFieldStateStore();

    private unsubscribe: (() => void) | null = null;
    private debouncedEvaluate: DebouncedFunc<(values: Record<string, unknown>) => void> | null =
        null;
    private applyingAssignments = false;
    private prevAssignments: Record<string, unknown> = {};
    private engine: BuiltRuleEngine | null = null;
    private form: UseFormReturn<Record<string, unknown>> | null = null;
    private effectHandlersRef: RefObject<EffectHandlersMap | undefined> | null = null;

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

        const evaluate = (values: Record<string, unknown>) => {
            if (this.applyingAssignments) {
                this.applyingAssignments = false;
                return;
            }

            if (!this.engine || !this.form) return;

            const next = evaluateFormState(
                this.engine,
                values,
                this.effectHandlersRef?.current ?? undefined
            );

            this.applyAssignments(next.fieldMap);
            this.fieldStore.setState(next.fieldMap);
            this.nonFieldStore.setState(next.sectionMap, next.feedback);
        };

        this.debouncedEvaluate = debounce(evaluate, DEBOUNCE_MS);
        evaluate(form.getValues());

        this.unsubscribe = form.subscribe({
            formState: { values: true },
            callback: ({ values }) => {
                this.debouncedEvaluate?.(values);
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

        this.applyingAssignments = true;

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
