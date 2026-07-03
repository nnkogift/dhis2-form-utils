import type { RuleTraceEntry } from '@dhis2-form-utils/hooks';

export type GraphNodeKind = 'field' | 'section' | 'feedback' | 'rule';

export type GraphNode = {
    id: string;
    kind: GraphNodeKind;
    label: string;
};

export type GraphEdge = {
    id: string;
    source: string;
    target: string;
    effectType?: string;
    fireCount: number;
};

export type RuleDependencyGraph = {
    nodes: GraphNode[];
    edges: GraphEdge[];
};

const nodeKey = (kind: GraphNodeKind, id: string) => `${kind}:${id}`;

const edgeKey = (source: string, ruleId: string, target: string, effectType?: string) =>
    `${source}|${ruleId}|${target}|${effectType ?? ''}`;

export function accumulateGraph(
    previous: RuleDependencyGraph,
    entry: RuleTraceEntry,
    resolveRuleName?: (ruleId: string) => string | undefined
): RuleDependencyGraph {
    const nodes = new Map(previous.nodes.map((node) => [node.id, node]));
    const edges = new Map(previous.edges.map((edge) => [edge.id, edge]));

    const ensureNode = (kind: GraphNodeKind, id: string, label: string) => {
        const key = nodeKey(kind, id);
        if (!nodes.has(key)) {
            nodes.set(key, { id: key, kind, label });
        }
        return key;
    };

    for (const fieldId of entry.changedFields) {
        ensureNode('field', fieldId, fieldId);
    }

    for (const ruleResult of entry.ruleResults) {
        const ruleLabel = resolveRuleName?.(ruleResult.ruleId) ?? ruleResult.ruleId;
        const ruleNodeId = ensureNode('rule', ruleResult.ruleId, ruleLabel);

        for (const fieldId of entry.changedFields) {
            const fieldNodeId = ensureNode('field', fieldId, fieldId);
            const id = edgeKey(fieldNodeId, ruleResult.ruleId, ruleNodeId, 'read');
            const existing = edges.get(id);
            edges.set(id, {
                id,
                source: fieldNodeId,
                target: ruleNodeId,
                effectType: 'read',
                fireCount: (existing?.fireCount ?? 0) + 1,
            });
        }

        for (const effect of ruleResult.effects) {
            const targetKind: GraphNodeKind =
                effect.type === 'HIDESECTION'
                    ? 'section'
                    : effect.type === 'DISPLAYTEXT' || effect.type === 'DISPLAYKEYVALUEPAIR'
                      ? 'feedback'
                      : 'field';

            const targetNodeId = ensureNode(targetKind, effect.targetId, effect.targetId);
            const id = edgeKey(ruleNodeId, ruleResult.ruleId, targetNodeId, effect.type);
            const existing = edges.get(id);
            edges.set(id, {
                id,
                source: ruleNodeId,
                target: targetNodeId,
                effectType: effect.type,
                fireCount: (existing?.fireCount ?? 0) + 1,
            });
        }
    }

    return {
        nodes: [...nodes.values()],
        edges: [...edges.values()],
    };
}

export function buildGraphFromTrace(
    entries: readonly RuleTraceEntry[],
    resolveRuleName?: (ruleId: string) => string | undefined
): RuleDependencyGraph {
    return entries.reduce<RuleDependencyGraph>(
        (graph, entry) => accumulateGraph(graph, entry, resolveRuleName),
        { nodes: [], edges: [] }
    );
}
