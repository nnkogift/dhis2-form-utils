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

// 3 fields, 2 rules, mixed read/warn/hide -> 6 edges (dense), mirrors the busy screenshot.
const denseGraph: RuleDependencyGraph = {
    nodes: [
        { id: 'field:age', kind: 'field', label: 'Age' },
        { id: 'field:weight', kind: 'field', label: 'Weight' },
        { id: 'field:height', kind: 'field', label: 'Height' },
        { id: 'rule:r1', kind: 'rule', label: 'Rule 1' },
        { id: 'rule:r2', kind: 'rule', label: 'Rule 2' },
        { id: 'section:s1', kind: 'section', label: 'Section 1' },
    ],
    edges: [
        { id: 'e1', source: 'field:age', target: 'rule:r1', effectType: 'read', fireCount: 1 },
        { id: 'e2', source: 'field:weight', target: 'rule:r1', effectType: 'read', fireCount: 1 },
        { id: 'e3', source: 'field:height', target: 'rule:r2', effectType: 'read', fireCount: 1 },
        {
            id: 'e4',
            source: 'rule:r1',
            target: 'field:age',
            effectType: 'SHOWWARNING',
            fireCount: 1,
        },
        {
            id: 'e5',
            source: 'rule:r1',
            target: 'section:s1',
            effectType: 'HIDESECTION',
            fireCount: 1,
        },
        {
            id: 'e6',
            source: 'rule:r2',
            target: 'field:height',
            effectType: 'SHOWWARNING',
            fireCount: 1,
        },
    ],
};

describe('toFlowGraph', () => {
    it('maps edges with stroke, markers, and the custom edge type', () => {
        const { edges } = toFlowGraph(graph, {}, {}, null);

        expect(edges).toHaveLength(3);
        for (const edge of edges) {
            expect(edge.type).toBe('ruleGraphEdge');
            expect(edge.style?.stroke).toBeDefined();
            const markerEnd = edge.markerEnd as { type: MarkerType; color: string };
            expect(markerEnd.type).toBe(MarkerType.ArrowClosed);
            expect(typeof markerEnd.color).toBe('string');
        }

        const readEdge = edges.find((edge) => edge.data?.label === 'read');
        expect(readEdge?.style?.strokeWidth).toBe(1);
        expect(readEdge?.style?.stroke).toBe('#00796b');

        const warnEdge = edges.find((edge) => edge.data?.label === 'warn');
        expect(warnEdge?.style?.stroke).toBe('#ff8302');
    });

    it('does not animate read edges but animates highlighted effect edges', () => {
        const { edges } = toFlowGraph(graph, {}, {}, null);

        const readEdge = edges.find((edge) => edge.data?.label === 'read');
        expect(readEdge?.animated).toBe(false);

        const warnEdge = edges.find((edge) => edge.data?.label === 'warn');
        expect(warnEdge?.animated).toBe(true);
    });

    it('dims non-highlighted edges when a filter is active', () => {
        const highlightedKeys = new Set(['rule:rule-1', 'field:age']);
        const { edges } = toFlowGraph(graph, {}, {}, highlightedKeys);

        const sectionEdge = edges.find((edge) => edge.target === 'section:section-a');
        expect(sectionEdge?.style?.opacity).toBe(0.35);
        expect(sectionEdge?.zIndex).toBe(0);

        const readEdge = edges.find((edge) => edge.data?.label === 'read');
        expect(readEdge?.style?.opacity).toBe(0.5);
        expect(readEdge?.zIndex).toBe(1);
    });

    it('splits a dual-role field so effect edges target the right column', () => {
        const { nodes, edges } = toFlowGraph(graph, {}, {}, null);

        expect(nodes.map((node) => node.id)).toEqual(
            expect.arrayContaining(['field:age@src', 'field:age@tgt'])
        );

        const warnEdge = edges.find((edge) => edge.data?.label === 'warn');
        expect(warnEdge?.target).toBe('field:age@tgt');

        const src = nodes.find((node) => node.id === 'field:age@src');
        const tgt = nodes.find((node) => node.id === 'field:age@tgt');
        const rule = nodes.find((node) => node.id === 'rule:rule-1');
        expect(src?.position.x).toBeLessThan(rule?.position.x ?? 0);
        expect(rule?.position.x).toBeLessThan(tgt?.position.x ?? 0);
    });

    it('keeps read labels visible while the graph is small', () => {
        const { edges } = toFlowGraph(graph, {}, {}, null);

        const readEdge = edges.find((edge) => edge.data?.label === 'read');
        expect(readEdge?.data?.showLabel).toBe(true);
    });

    it('suppresses read labels in dense graphs while keeping effect labels', () => {
        const { edges } = toFlowGraph(denseGraph, {}, {}, null);

        for (const edge of edges) {
            if (edge.data?.label === 'read') {
                expect(edge.data.showLabel).toBe(false);
            } else {
                expect(edge.data?.showLabel).toBe(true);
            }
        }
    });

    it('fans out parallel edges from the same source with increasing offset', () => {
        const { edges } = toFlowGraph(denseGraph, {}, {}, null);

        const warnFromR1 = edges.find((edge) => edge.id === 'e4');
        const hideFromR1 = edges.find((edge) => edge.id === 'e5');
        expect(warnFromR1?.data?.offset).toBe(20);
        expect(hideFromR1?.data?.offset).toBe(34);
    });
});
