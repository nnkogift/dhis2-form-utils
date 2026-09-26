import { describe, expect, it, vi } from 'vitest';
import type { RuleTraceEntry } from '@nnkogift/dhis2-form-utils-hooks';
import { createRuleTraceStore } from './traceStore';

const sampleEntry = (id: string): RuleTraceEntry => ({
    id,
    timestamp: Date.now(),
    changedFields: ['field-a'],
    ruleResults: [],
});

describe('createRuleTraceStore', () => {
    it('stores entries in a bounded ring buffer', () => {
        const store = createRuleTraceStore(2);
        store.record(sampleEntry('1'));
        store.record(sampleEntry('2'));
        store.record(sampleEntry('3'));

        expect(store.getSnapshot().map((entry) => entry.id)).toEqual(['2', '3']);
    });

    it('notifies subscribers when entries are recorded', () => {
        const store = createRuleTraceStore();
        const listener = vi.fn();
        store.subscribe(listener);

        store.record(sampleEntry('1'));
        expect(listener).toHaveBeenCalledTimes(1);
    });
});
