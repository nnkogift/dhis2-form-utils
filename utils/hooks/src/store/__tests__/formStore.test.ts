import { describe, expect, it, vi, afterEach } from 'vitest';
import { ProgramRuleActionType } from '@nnkogift/dhis2-form-utils-metadata';
import { createRef } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { RuleTraceEntry } from '../../buildTraceEntry';
import { FormStore } from '../../formStore';

describe('FormStore', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('applies an ASSIGN effect from the initial evaluation via form.setValue', () => {
        const engine = {
            evaluate: () => [
                {
                    ruleId: 'rule-assign',
                    ruleActionType: ProgramRuleActionType.ASSIGN,
                    dataElement: 'field-a',
                    data: 'assigned',
                },
            ],
        };

        const setValue = vi.fn();
        const form = {
            getValues: () => ({ 'field-a': '' }),
            setValue,
            subscribe: vi.fn(() => vi.fn()),
        } as unknown as UseFormReturn<Record<string, unknown>>;

        const store = new FormStore();
        store.init(form, engine, createRef());

        expect(setValue).toHaveBeenCalledWith(
            'field-a',
            'assigned',
            expect.objectContaining({ shouldDirty: false })
        );
    });

    it('does not swallow a real user edit that follows an initial-load ASSIGN', () => {
        vi.useFakeTimers();

        let evaluateCount = 0;
        const values: Record<string, unknown> = { 'field-a': '', 'field-b': '' };
        const engine = {
            evaluate: () => {
                evaluateCount += 1;
                // Only assigns once: after the first pass field-a already holds 'assigned',
                // so the dedup in applyAssignments naturally stops further setValue calls.
                if (values['field-a'] === '') {
                    return [
                        {
                            ruleId: 'rule-assign',
                            ruleActionType: ProgramRuleActionType.ASSIGN,
                            dataElement: 'field-a',
                            data: 'assigned',
                        },
                    ];
                }
                return [];
            },
        };

        let notify:
            | ((arg: { name?: string; values?: Record<string, unknown> }) => void)
            | undefined;
        const form = {
            getValues: () => values,
            setValue: vi.fn((name: string, value: unknown) => {
                values[name] = value;
                notify?.({ name, values });
            }),
            subscribe: ({
                callback,
            }: {
                callback: (arg: { name?: string; values?: Record<string, unknown> }) => void;
            }) => {
                notify = callback;
                return vi.fn();
            },
        } as unknown as UseFormReturn<Record<string, unknown>>;

        const store = new FormStore();
        store.init(form, engine, createRef());

        // init() -> evaluate([]) assigns field-a, which echoes back through
        // form.setValue -> subscribe callback -> a debounced evaluate is scheduled.
        const countAfterInit = evaluateCount;

        // A genuine user edit to a different field, landing after init.
        notify?.({ name: 'field-b', values });
        vi.advanceTimersByTime(50);

        expect(countAfterInit).toBe(1);
        // The echo-triggered cycle and the real edit both ran the engine -- neither was dropped.
        expect(evaluateCount).toBe(2);
    });

    it('does not recreate subscription when effectHandlers ref is unchanged', () => {
        const evaluate = vi.fn(() => []);
        const engine = { evaluate };
        const form = {
            getValues: () => ({}),
            setValue: vi.fn(),
            subscribe: vi.fn(() => vi.fn()),
        } as unknown as UseFormReturn<Record<string, unknown>>;

        const handlersRef: { current: { CUSTOM?: () => void } | undefined } = {
            current: { CUSTOM: vi.fn() },
        };

        const store = new FormStore();
        store.init(form, engine, handlersRef);
        const subscribeCalls = (form.subscribe as ReturnType<typeof vi.fn>).mock.calls.length;

        handlersRef.current = { CUSTOM: vi.fn() };
        store.init(form, engine, handlersRef);

        expect((form.subscribe as ReturnType<typeof vi.fn>).mock.calls.length).toBe(subscribeCalls);
    });

    it('replays cached trace entry when listener attaches after init', () => {
        const engine = {
            evaluate: () => [
                {
                    ruleId: 'rule-1',
                    ruleActionType: ProgramRuleActionType.SHOWWARNING,
                    dataElement: 'field-a',
                    content: 'Warning',
                },
            ],
        };
        const form = {
            getValues: () => ({ 'field-a': '1' }),
            setValue: vi.fn(),
            subscribe: vi.fn(() => vi.fn()),
        } as unknown as UseFormReturn<Record<string, unknown>>;

        const store = new FormStore();
        store.init(form, engine, createRef());

        const entries: RuleTraceEntry[] = [];
        store.subscribeTrace((entry) => {
            entries.push(entry);
        });

        expect(entries).toHaveLength(1);
        expect(entries[0]?.changedFields).toEqual([]);
        expect(entries[0]?.ruleResults[0]?.ruleId).toBe('rule-1');
    });

    it('emits trace entries with changedFields when listeners are attached', () => {
        vi.useFakeTimers();

        const engine = {
            evaluate: () => [
                {
                    ruleId: 'rule-1',
                    ruleActionType: ProgramRuleActionType.SHOWWARNING,
                    dataElement: 'field-a',
                    content: 'Warning',
                },
            ],
        };

        let notify: ((arg: { name?: string }) => void) | undefined;
        const form = {
            getValues: () => ({ 'field-a': '1' }),
            setValue: vi.fn(),
            subscribe: ({ callback }: { callback: (arg: { name?: string }) => void }) => {
                notify = callback;
                return vi.fn();
            },
        } as unknown as UseFormReturn<Record<string, unknown>>;

        const store = new FormStore();
        const entries: Array<{ changedFields: string[]; ruleId?: string }> = [];
        store.subscribeTrace((entry) => {
            entries.push({
                changedFields: entry.changedFields,
                ruleId: entry.ruleResults[0]?.ruleId,
            });
        });
        store.init(form, engine, createRef());

        expect(entries).toHaveLength(1);
        expect(entries[0]?.changedFields).toEqual([]);
        expect(entries[0]?.ruleId).toBe('rule-1');

        notify?.({ name: 'field-a' });
        vi.advanceTimersByTime(50);

        expect(entries).toHaveLength(2);
        expect(entries[1]?.changedFields).toEqual(['field-a']);
        expect(entries[1]?.ruleId).toBe('rule-1');
    });
});
