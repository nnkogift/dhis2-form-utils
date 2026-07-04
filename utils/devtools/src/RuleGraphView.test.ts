import { MarkerType } from '@xyflow/react';
import { describe, expect, it } from 'vitest';
import { toFlowGraph } from './RuleGraphView';
import type { RuleDependencyGraph } from './buildGraph';

const graph: RuleDependencyGraph = {
    nodes: [
        { id: 'field:age', kind: 'field', label: 'Age (years)' },
        { id: 'rule:rule-1', kind: 'rule', label: 'Age warning rule' },
        { id: 'section:section-a', kind: 'section', label: 'Clinical data' },
    ],
    edges: [
        {
            id: 'field:age|rule-1|rule:rule-1|read',
            source: 'field:age',
            target: 'rule:rule-1',
            effectType: 'read',
            fireCount: 2,
        },
        {
            id: 'rule:rule-1|rule-1|field:age|SHOWWARNING',
            source: 'rule:rule-1',
            target: 'field:age',
            effectType: 'SHOWWARNING',
            fireCount: 1,
        },
        {
            id: 'rule:rule-1|rule-1|section:section-a|HIDESECTION',
            source: 'rule:rule-1',
            target: 'section:section-a',
            effectType: 'HIDESECTION',
            fireCount: 1,
        },
    ],
};

describe('toFlowGraph', () => {
    it('maps edges with stroke, markers, and smoothstep type', () => {
        const { edges } = toFlowGraph(graph, {}, {}, null);

        expect(edges).toHaveLength(3);
        for (const edge of edges) {
            expect(edge.type).toBe('smoothstep');
            expect(edge.style?.stroke).toBeDefined();
            const markerEnd = edge.markerEnd as { type: MarkerType; color: string };
            expect(markerEnd.type).toBe(MarkerType.ArrowClosed);
            expect(typeof markerEnd.color).toBe('string');
        }

        const readEdge = edges.find((edge) => edge.label === 'read');
        expect(readEdge?.style?.strokeWidth).toBe(3);
        expect(readEdge?.style?.stroke).toBe('#00796b');

        const warnEdge = edges.find((edge) => edge.label === 'warn');
        expect(warnEdge?.style?.stroke).toBe('#ff8302');
    });

    it('dims non-highlighted edges when a filter is active', () => {
        const highlightedKeys = new Set(['rule:rule-1', 'field:age']);
        const { edges } = toFlowGraph(graph, {}, {}, highlightedKeys);

        const sectionEdge = edges.find((edge) => edge.target === 'section:section-a');
        expect(sectionEdge?.style?.opacity).toBe(0.4);

        const readEdge = edges.find((edge) => edge.label === 'read');
        expect(readEdge?.style?.opacity).toBe(1);
    });
});
