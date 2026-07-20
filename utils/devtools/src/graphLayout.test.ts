import { describe, expect, it } from 'vitest';
import { computeGraphLayout, LANE_HEIGHT, prepareFlowGraph, ROLE_COLUMNS } from './graphLayout';
import type { RuleDependencyGraph } from './buildGraph';

const readEdge = (source: string, target: string) => ({
    id: `${source}|${target}|read`,
    source,
    target,
    effectType: 'read',
    fireCount: 1,
});

const effectEdge = (source: string, target: string, effectType: string) => ({
    id: `${source}|${target}|${effectType}`,
    source,
    target,
    effectType,
    fireCount: 1,
});

describe('prepareFlowGraph', () => {
    it('splits a field that is both read source and effect target into src and tgt nodes', () => {
        const graph: RuleDependencyGraph = {
            nodes: [
                { id: 'field:age', kind: 'field', label: 'Age' },
                { id: 'rule:r1', kind: 'rule', label: 'Rule 1' },
            ],
            edges: [
                readEdge('field:age', 'rule:r1'),
                effectEdge('rule:r1', 'field:age', 'SHOWWARNING'),
            ],
        };

        const { nodes, edges } = prepareFlowGraph(graph);

        expect(nodes.map((node) => node.id)).toEqual(
            expect.arrayContaining(['field:age@src', 'field:age@tgt', 'rule:r1'])
        );
        expect(edges).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ source: 'field:age@src', target: 'rule:r1' }),
                expect.objectContaining({ source: 'rule:r1', target: 'field:age@tgt' }),
            ])
        );
    });
});

describe('computeGraphLayout', () => {
    it('puts a field source, its rule, and the rule target on the same lane left to right', () => {
        const graph: RuleDependencyGraph = {
            nodes: [
                { id: 'field:age', kind: 'field', label: 'Age' },
                { id: 'rule:r1', kind: 'rule', label: 'Rule 1' },
                { id: 'section:s1', kind: 'section', label: 'Section 1' },
            ],
            edges: [
                readEdge('field:age', 'rule:r1'),
                effectEdge('rule:r1', 'section:s1', 'HIDESECTION'),
            ],
        };

        const { nodes, edges } = prepareFlowGraph(graph);
        const positions = computeGraphLayout(nodes, edges);

        expect(positions.get('rule:r1')).toEqual({ x: ROLE_COLUMNS.rule, y: 0 });
        expect(positions.get('field:age')?.y).toBe(0);
        expect(positions.get('section:s1')?.y).toBe(0);
        expect(positions.get('field:age')?.x).toBe(ROLE_COLUMNS.source);
        expect(positions.get('section:s1')?.x).toBe(ROLE_COLUMNS.target);
        expect(positions.get('field:age')?.x).toBeLessThan(positions.get('rule:r1')?.x ?? 0);
        expect(positions.get('rule:r1')?.x).toBeLessThan(positions.get('section:s1')?.x ?? 0);
    });

    it('places effect-only field targets in the target column, not the source column', () => {
        const graph: RuleDependencyGraph = {
            nodes: [
                { id: 'rule:r1', kind: 'rule', label: 'Rule 1' },
                { id: 'field:a', kind: 'field', label: 'A' },
                { id: 'field:b', kind: 'field', label: 'B' },
            ],
            edges: [
                effectEdge('rule:r1', 'field:a', 'SHOWWARNING'),
                effectEdge('rule:r1', 'field:b', 'SHOWWARNING'),
            ],
        };

        const { nodes, edges } = prepareFlowGraph(graph);
        const positions = computeGraphLayout(nodes, edges);

        expect(positions.get('field:a')?.x).toBe(ROLE_COLUMNS.target);
        expect(positions.get('field:b')?.x).toBe(ROLE_COLUMNS.target);
        const yA = positions.get('field:a')?.y;
        const yB = positions.get('field:b')?.y;
        expect(yA).toBe(0);
        expect(yB).not.toBe(yA);
    });

    it('places split field src left and tgt right on the same lane', () => {
        const graph: RuleDependencyGraph = {
            nodes: [
                { id: 'field:age', kind: 'field', label: 'Age' },
                { id: 'rule:r1', kind: 'rule', label: 'Rule 1' },
            ],
            edges: [
                readEdge('field:age', 'rule:r1'),
                effectEdge('rule:r1', 'field:age', 'HIDEFIELD'),
            ],
        };

        const { nodes, edges } = prepareFlowGraph(graph);
        const positions = computeGraphLayout(nodes, edges);

        expect(positions.get('field:age@src')?.x).toBe(ROLE_COLUMNS.source);
        expect(positions.get('field:age@tgt')?.x).toBe(ROLE_COLUMNS.target);
        expect(positions.get('field:age@src')?.y).toBe(positions.get('field:age@tgt')?.y);
        expect(positions.get('field:age@src')?.x).toBeLessThan(positions.get('rule:r1')?.x ?? 0);
        expect(positions.get('rule:r1')?.x).toBeLessThan(positions.get('field:age@tgt')?.x ?? 0);
    });

    it('places a field wired to several rules on the median lane', () => {
        const graph: RuleDependencyGraph = {
            nodes: [
                { id: 'rule:r1', kind: 'rule', label: 'Rule 1' },
                { id: 'rule:r2', kind: 'rule', label: 'Rule 2' },
                { id: 'rule:r3', kind: 'rule', label: 'Rule 3' },
                { id: 'field:shared', kind: 'field', label: 'Shared' },
            ],
            edges: [readEdge('field:shared', 'rule:r1'), readEdge('field:shared', 'rule:r3')],
        };

        const { nodes, edges } = prepareFlowGraph(graph);
        const positions = computeGraphLayout(nodes, edges);

        expect(positions.get('field:shared')?.y).toBe(LANE_HEIGHT);
    });
});
