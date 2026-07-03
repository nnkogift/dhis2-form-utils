import { memo, useMemo } from 'react';
import {
    Background,
    Controls,
    type Edge,
    Handle,
    type Node,
    type NodeProps,
    Position,
    ReactFlow,
} from '@xyflow/react';
import { NoticeBox } from '@dhis2/ui';
import type { RuleTraceEntry } from '@dhis2-form-utils/hooks';
import type { FormStore } from '@dhis2-form-utils/hooks';
import { buildGraphFromTrace, type GraphNode, type RuleDependencyGraph } from './buildGraph';
import { translate } from './i18n';

type FieldStateMap = ReturnType<FormStore['fieldStore']['getSnapshot']>;

type RuleNodeData = {
    label: string;
    kind: GraphNode['kind'];
    value?: string;
    highlighted: boolean;
};

type RuleGraphViewProps = {
    entries: readonly RuleTraceEntry[];
    fieldState: FieldStateMap;
    formValues: Record<string, unknown>;
    selectedEntryId: string | null;
    highlightRuleId: string | null;
    resolveRuleName?: (ruleId: string) => string | undefined;
};

const KIND_COLUMNS: Record<GraphNode['kind'], number> = {
    field: 0,
    rule: 260,
    section: 520,
    feedback: 520,
};

const KIND_ROW_HEIGHT = 88;

const KIND_LABELS: Record<GraphNode['kind'], string> = {
    field: 'Field',
    rule: 'Rule',
    section: 'Section',
    feedback: 'Feedback',
};

function layoutNode(node: GraphNode, indexWithinKind: number): { x: number; y: number } {
    const column = KIND_COLUMNS[node.kind];
    const row =
        node.kind === 'section'
            ? indexWithinKind
            : node.kind === 'feedback'
              ? indexWithinKind + 0.5
              : indexWithinKind;

    return { x: column, y: row * KIND_ROW_HEIGHT };
}

function RuleGraphNode({ data }: NodeProps<Node<RuleNodeData>>) {
    return (
        <div
            className={`rule-devtools-graph-node rule-devtools-graph-node--${data.kind} ${
                data.highlighted ? '' : 'rule-devtools-graph-node--dimmed'
            }`}
        >
            <Handle type="target" position={Position.Left} />
            <span className="rule-devtools-graph-node-kind">{KIND_LABELS[data.kind]}</span>
            <div className="rule-devtools-graph-node-label">{data.label}</div>
            {data.value !== undefined ? (
                <div className="rule-devtools-graph-node-value">{data.value}</div>
            ) : null}
            <Handle type="source" position={Position.Right} />
        </div>
    );
}

const nodeTypes = {
    ruleGraphNode: memo(RuleGraphNode),
};

function effectNodeKey(effect: RuleTraceEntry['ruleResults'][number]['effects'][number]): string {
    const kind =
        effect.type === 'HIDESECTION'
            ? 'section'
            : effect.type === 'DISPLAYTEXT' || effect.type === 'DISPLAYKEYVALUEPAIR'
              ? 'feedback'
              : 'field';
    return `${kind}:${effect.targetId}`;
}

function entryGraphKeys(entry: RuleTraceEntry): Set<string> {
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

function ruleGraphKeys(entries: readonly RuleTraceEntry[], ruleId: string): Set<string> {
    const keys = new Set<string>([`rule:${ruleId}`]);

    for (const entry of entries) {
        for (const result of entry.ruleResults) {
            if (result.ruleId !== ruleId) {
                continue;
            }
            for (const effect of result.effects) {
                keys.add(effectNodeKey(effect));
            }
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

function toFlowGraph(
    graph: RuleDependencyGraph,
    fieldState: FieldStateMap,
    formValues: Record<string, unknown>,
    highlightedKeys: Set<string> | null
): { nodes: Node<RuleNodeData>[]; edges: Edge[] } {
    const kindCounters: Record<GraphNode['kind'], number> = {
        field: 0,
        rule: 0,
        section: 0,
        feedback: 0,
    };

    const nodes: Node<RuleNodeData>[] = graph.nodes.map((node) => {
        const index = kindCounters[node.kind];
        kindCounters[node.kind] += 1;
        const position = layoutNode(node, index);
        const rawFieldId = node.kind === 'field' ? node.label : undefined;
        const assignedValue = rawFieldId ? fieldState[rawFieldId].assignedValue : undefined;
        const formValue = rawFieldId ? formValues[rawFieldId] : undefined;
        const displayValue = formatDisplayValue(assignedValue) ?? formatDisplayValue(formValue);

        return {
            id: node.id,
            type: 'ruleGraphNode',
            position,
            data: {
                label: node.label,
                kind: node.kind,
                value: displayValue,
                highlighted: highlightedKeys ? highlightedKeys.has(node.id) : true,
            },
        };
    });

    const edges: Edge[] = graph.edges.map((edge) => {
        const isHighlighted = highlightedKeys
            ? highlightedKeys.has(edge.source) && highlightedKeys.has(edge.target)
            : true;

        return {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: edge.effectType === 'read' ? 'read' : edge.effectType,
            animated: isHighlighted && edge.effectType !== 'read',
            className: isHighlighted ? undefined : 'rule-devtools-graph-edge--dimmed',
            style: {
                strokeWidth: Math.min(1 + edge.fireCount, 4),
            },
        };
    });

    return { nodes, edges };
}

function GraphLegend() {
    const items: Array<{ kind: GraphNode['kind']; label: string }> = [
        { kind: 'field', label: translate('Field') },
        { kind: 'rule', label: translate('Rule') },
        { kind: 'section', label: translate('Section') },
        { kind: 'feedback', label: translate('Feedback') },
    ];

    return (
        <div className="rule-devtools-graph-legend" aria-hidden="true">
            {items.map((item) => (
                <span key={item.kind} className="rule-devtools-legend-item">
                    <span
                        className={`rule-devtools-legend-swatch rule-devtools-legend-swatch--${item.kind}`}
                    />
                    {item.label}
                </span>
            ))}
        </div>
    );
}

export function RuleGraphView({
    entries,
    fieldState,
    formValues,
    selectedEntryId,
    highlightRuleId,
    resolveRuleName,
}: RuleGraphViewProps) {
    const graph = useMemo(
        () => buildGraphFromTrace(entries, resolveRuleName),
        [entries, resolveRuleName]
    );

    const highlightedKeys = useMemo(() => {
        if (!selectedEntryId && !highlightRuleId) {
            return null;
        }

        const keys = new Set<string>();

        if (selectedEntryId) {
            const entry = entries.find((item) => item.id === selectedEntryId);
            if (entry) {
                for (const key of entryGraphKeys(entry)) {
                    keys.add(key);
                }
            }
        }

        if (highlightRuleId) {
            for (const key of ruleGraphKeys(entries, highlightRuleId)) {
                keys.add(key);
            }
        }

        return keys;
    }, [entries, highlightRuleId, selectedEntryId]);

    const { nodes, edges } = useMemo(
        () => toFlowGraph(graph, fieldState, formValues, highlightedKeys),
        [graph, fieldState, formValues, highlightedKeys]
    );

    if (!graph.nodes.length) {
        return (
            <div className="rule-devtools-notice">
                <NoticeBox title={translate('No rule relationships yet')}>
                    {translate(
                        'Interact with the form to build the dependency graph. Only rules and effects that have fired during this session are shown.'
                    )}
                </NoticeBox>
            </div>
        );
    }

    return (
        <div className="rule-devtools-graph-layout">
            <GraphLegend />
            <div className="rule-devtools-graph-canvas">
                <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
                    <Background gap={16} size={1} />
                    <Controls showInteractive={false} />
                </ReactFlow>
            </div>
        </div>
    );
}
