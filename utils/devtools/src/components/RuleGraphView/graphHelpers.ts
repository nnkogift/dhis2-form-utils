import { MarkerType, type Edge, type Node } from '@xyflow/react';
import type { RuleTraceEntry } from '@nnkogift/dhis2-form-utils-hooks';
import type { RuleDependencyGraph } from '../../graph/buildGraph';
import { computeGraphLayout, prepareFlowGraph } from '../../graph/graphLayout';
import { getEffectEdgeStroke, getEffectShortLabel } from '../../styles/effectStyles';
import {
    READ_LABEL_EDGE_THRESHOLD,
    type FieldStateMap,
    type RuleGraphEdgeData,
    type RuleNodeData,
} from './types';

function effectNodeKey(effect: RuleTraceEntry['ruleResults'][number]['effects'][number]): string {
    const kind =
        effect.type === 'HIDESECTION'
            ? 'section'
            : effect.type === 'DISPLAYTEXT' || effect.type === 'DISPLAYKEYVALUEPAIR'
              ? 'feedback'
              : 'field';
    return `${kind}:${effect.targetId}`;
}

export function entryGraphKeys(entry: RuleTraceEntry): Set<string> {
    const keys = new Set<string>();

    for (const fieldId of entry.changedFields) {
        keys.add(`field:${fieldId}`);
    }

    for (const result of entry.ruleResults) {
        keys.add(`rule:${result.ruleId}`);
        for (const effect of result.effects) {
            keys.add(effectNodeKey(effect));
        }
    }

    return keys;
}

export function ruleGraphKeys(entry: RuleTraceEntry, ruleId: string): Set<string> {
    const keys = new Set<string>([`rule:${ruleId}`]);

    for (const result of entry.ruleResults) {
        if (result.ruleId !== ruleId) {
            continue;
        }
        for (const effect of result.effects) {
            keys.add(effectNodeKey(effect));
        }
    }

    return keys;
}

const formatDisplayValue = (value: unknown): string | undefined => {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    return JSON.stringify(value);
};

// fallow-ignore-next-line complexity
export function toFlowGraph(
    graph: RuleDependencyGraph,
    fieldState: FieldStateMap,
    formValues: Record<string, unknown>,
    highlightedKeys: Set<string> | null
): { nodes: Node<RuleNodeData>[]; edges: Edge<RuleGraphEdgeData>[] } {
    const { nodes: flowNodes, edges: flowEdges } = prepareFlowGraph(graph);
    const positions = computeGraphLayout(flowNodes, flowEdges);
    const graphNodeIdByFlowId = new Map(flowNodes.map((node) => [node.id, node.graphNodeId]));

    const nodes: Node<RuleNodeData>[] = flowNodes.map((node) => {
        const position = positions.get(node.id) ?? { x: 0, y: 0 };
        const rawFieldId =
            node.kind === 'field' ? node.graphNodeId.slice('field:'.length) : undefined;
        const assignedValue =
            rawFieldId && rawFieldId in fieldState
                ? fieldState[rawFieldId].assignedValue
                : undefined;
        const formValue = rawFieldId ? formValues[rawFieldId] : undefined;
        const displayValue = formatDisplayValue(assignedValue) ?? formatDisplayValue(formValue);

        return {
            id: node.id,
            type: 'ruleGraphNode',
            position,
            data: {
                label: node.label,
                kind: node.kind,
                graphNodeId: node.graphNodeId,
                value: displayValue,
                highlighted: highlightedKeys ? highlightedKeys.has(node.graphNodeId) : true,
            },
        };
    });

    const dense = flowEdges.length > READ_LABEL_EDGE_THRESHOLD;
    const sourceFanOut = new Map<string, number>();

    // fallow-ignore-next-line complexity
    const edges: Edge<RuleGraphEdgeData>[] = flowEdges.map((edge) => {
        const sourceGraphId = graphNodeIdByFlowId.get(edge.source) ?? edge.source;
        const targetGraphId = graphNodeIdByFlowId.get(edge.target) ?? edge.target;
        const isHighlighted = highlightedKeys
            ? highlightedKeys.has(sourceGraphId) && highlightedKeys.has(targetGraphId)
            : true;
        const effectType = edge.effectType ?? 'default';
        const isRead = effectType === 'read';
        const stroke = getEffectEdgeStroke(effectType, isHighlighted);
        const label = getEffectShortLabel(effectType);
        const showLabel = !(isRead && dense);

        const fanIndex = sourceFanOut.get(edge.source) ?? 0;
        sourceFanOut.set(edge.source, fanIndex + 1);
        const offset = 20 + fanIndex * 14;

        return {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: 'ruleGraphEdge',
            animated: isHighlighted && !isRead,
            zIndex: isHighlighted ? 1 : 0,
            style: {
                stroke,
                strokeWidth: isRead ? 1 : Math.min(1 + edge.fireCount, 4),
                opacity: isHighlighted ? (isRead ? 0.5 : 1) : 0.35,
            },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: stroke,
            },
            data: {
                label,
                stroke,
                showLabel,
                offset,
            },
        };
    });

    return { nodes, edges };
}
