import type { RuleTraceEntry } from '@dhis2-form-utils/hooks';
import { describe, expect, it } from 'vitest';
import { accumulateGraph, buildGraphFromTrace } from './buildGraph';
import type { DevtoolsLabelLookup } from './createLabelLookup';

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

const labelLookup: DevtoolsLabelLookup = {
    resolveRuleName: (id) => (id === 'rule-1' ? 'Age warning rule' : id),
    resolveFieldName: (id) => (id === 'age' ? 'Age (years)' : id),
    resolveSectionName: (id) => (id === 'section-a' ? 'Clinical data' : id),
};

describe('buildGraphFromTrace', () => {
    it('accumulates nodes and edges from trace entries', () => {
        const graph = buildGraphFromTrace([entry], labelLookup);

        expect(graph.nodes).toEqual(
            expect.arrayContaining([
                { id: 'field:age', kind: 'field', label: 'Age (years)' },
                { id: 'rule:rule-1', kind: 'rule', label: 'Age warning rule' },
                { id: 'section:section-a', kind: 'section', label: 'Clinical data' },
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

    it('includes only the rules from the supplied entries', () => {
        const laterEntry: RuleTraceEntry = {
            ...entry,
            id: 'entry-2',
            ruleResults: [
                {
                    ruleId: 'rule-2',
                    effects: [
                        {
                            type: 'HIDEFIELD',
                            targetId: 'weight',
                        },
                    ],
                },
            ],
        };

        const sessionGraph = buildGraphFromTrace([entry, laterEntry], labelLookup);
        const activeGraph = buildGraphFromTrace([laterEntry], labelLookup);

        expect(sessionGraph.nodes.filter((node) => node.kind === 'rule')).toHaveLength(2);
        expect(activeGraph.nodes.filter((node) => node.kind === 'rule')).toHaveLength(1);
        expect(activeGraph.nodes.some((node) => node.id === 'rule:rule-2')).toBe(true);
        expect(activeGraph.nodes.some((node) => node.id === 'rule:rule-1')).toBe(false);
    });
});
