import type { RuleTraceEntry } from '@dhis2-form-utils/hooks';
import { describe, expect, it } from 'vitest';
import { accumulateGraph, buildGraphFromTrace } from './buildGraph';

const entry: RuleTraceEntry = {
    id: 'entry-1',
    timestamp: 1000,
    changedFields: ['age'],
    ruleResults: [
        {
            ruleId: 'rule-1',
            effects: [
                {
                    type: 'SHOWWARNING',
                    targetId: 'age',
                },
                {
                    type: 'HIDESECTION',
                    targetId: 'section-a',
                },
            ],
        },
    ],
};

describe('buildGraphFromTrace', () => {
    it('accumulates nodes and edges from trace entries', () => {
        const graph = buildGraphFromTrace([entry], (id) =>
            id === 'rule-1' ? 'Age warning rule' : undefined
        );

        expect(graph.nodes).toEqual(
            expect.arrayContaining([
                { id: 'field:age', kind: 'field', label: 'age' },
                { id: 'rule:rule-1', kind: 'rule', label: 'Age warning rule' },
                { id: 'section:section-a', kind: 'section', label: 'section-a' },
            ])
        );

        expect(graph.edges).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    source: 'field:age',
                    target: 'rule:rule-1',
                    effectType: 'read',
                    fireCount: 1,
                }),
                expect.objectContaining({
                    source: 'rule:rule-1',
                    target: 'field:age',
                    effectType: 'SHOWWARNING',
                    fireCount: 1,
                }),
                expect.objectContaining({
                    source: 'rule:rule-1',
                    target: 'section:section-a',
                    effectType: 'HIDESECTION',
                    fireCount: 1,
                }),
            ])
        );
    });

    it('strengthens existing edges on repeated firings', () => {
        const first = accumulateGraph({ nodes: [], edges: [] }, entry);
        const second = accumulateGraph(first, entry);

        const readEdge = second.edges.find((edge) => edge.effectType === 'read');
        expect(readEdge?.fireCount).toBe(2);
    });
});
