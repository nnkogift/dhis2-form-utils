import { describe, expect, it, vi, afterEach } from 'vitest';
import { ProgramRuleActionType } from '@dhis2-form-utils/metadata';
import { createRef } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { FormStore } from '../../formStore';

describe('FormStore', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('skips debounced re-evaluation triggered by ASSIGN setValue', () => {
        vi.useFakeTimers();

        let evaluateCount = 0;
        const engine = {
            evaluate: () => {
                evaluateCount += 1;
                return [
                    {
                        ruleActionType: ProgramRuleActionType.ASSIGN,
                        dataElement: 'field-a',
                        data: 'assigned',
                    },
                ];
            },
        };

        let notify: ((arg: { values: Record<string, unknown> }) => void) | undefined;
        const form = {
            getValues: () => ({ 'field-a': '' }),
            setValue: vi.fn(() => {
                notify?.({ values: { 'field-a': 'assigned' } });
            }),
            subscribe: ({
                callback,
            }: {
                callback: (arg: { values: Record<string, unknown> }) => void;
            }) => {
                notify = callback;
                return vi.fn();
            },
        } as unknown as UseFormReturn<Record<string, unknown>>;

        const store = new FormStore();
        store.init(form, engine, createRef());

        const countAfterInit = evaluateCount;
        vi.advanceTimersByTime(50);

        expect(countAfterInit).toBe(1);
        expect(evaluateCount).toBe(1);
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
});
