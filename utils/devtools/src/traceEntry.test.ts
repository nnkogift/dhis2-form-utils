import { describe, expect, it } from 'vitest';
import type { RuleTraceEntry } from '@dhis2-form-utils/hooks';
import { getActiveRuleIds, resolveGraphTraceEntry } from './traceEntry';

const entry = (id: string, ruleIds: string[]): RuleTraceEntry => ({
    id,
    timestamp: 1000,
    changedFields: ['age'],
    ruleResults: ruleIds.map((ruleId) => ({ ruleId, effects: [] })),
});

describe('resolveGraphTraceEntry', () => {
    const entries = [entry('e1', ['rule-a']), entry('e2', ['rule-b']), entry('e3', ['rule-c'])];

    it('returns null when there are no entries', () => {
        expect(resolveGraphTraceEntry([])).toBeNull();
    });

    it('returns the latest entry by default', () => {
        expect(resolveGraphTraceEntry(entries)?.id).toBe('e3');
    });

    it('returns the selected entry when provided', () => {
        expect(resolveGraphTraceEntry(entries, 'e1')?.id).toBe('e1');
    });

    it('falls back to the latest entry when the selection is missing', () => {
        expect(resolveGraphTraceEntry(entries, 'missing')?.id).toBe('e3');
    });
});

describe('getActiveRuleIds', () => {
    it('returns rule ids from the latest evaluation only', () => {
        const entries = [entry('e1', ['rule-a']), entry('e2', ['rule-b', 'rule-c'])];
        expect(getActiveRuleIds(entries)).toEqual(new Set(['rule-b', 'rule-c']));
    });
});
