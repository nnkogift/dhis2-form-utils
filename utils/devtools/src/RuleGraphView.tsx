import { memo, useEffect, useMemo, type ReactNode } from 'react';
import {
    Background,
    Controls,
    type Edge,
    Handle,
    MarkerType,
    type Node,
    type NodeProps,
    Position,
    ReactFlow,
    ReactFlowProvider,
    useReactFlow,
} from '@xyflow/react';
import { NoticeBox } from '@dhis2/ui';
import type { RuleTraceEntry } from '@dhis2-form-utils/hooks';
import type { FormStore } from '@dhis2-form-utils/hooks';
import { buildGraphFromTrace, type GraphNode, type RuleDependencyGraph } from './buildGraph';
import type { DevtoolsLabelLookup } from './createLabelLookup';
import { EffectLegend } from './EffectBadge';
import {
    getEffectEdgeStroke,
    getEffectShortLabel,
    getEffectVariant,
    type EffectVisualVariant,
} from './effectStyles';
import { getGraphNodeClassName, getLegendSwatchClassName } from './graphNodeStyles';
import { translate } from './i18n';

type FieldStateMap = ReturnType<FormStore['fieldStore']['getSnapshot']>;

type RuleNodeData = {
    label: string;
    kind: GraphNode['kind'];
    value?: string;
    highlighted: boolean;
};

export type RuleGraphViewProps = {
    entries: readonly RuleTraceEntry[];
    fieldState: FieldStateMap;
    formValues: Record<string, unknown>;
    selectedEntryId: string | null;
    highlightRuleId: string | null;
    labelLookup?: DevtoolsLabelLookup;
    className?: string;
    layoutKey?: string | number;
    headerActions?: ReactNode;
    minHeightClassName?: string;
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

const DEFAULT_EDGE_OPTIONS = {
    type: 'smoothstep' as const,
    style: { stroke: getEffectEdgeStroke('default') },
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: getEffectEdgeStroke('default'),
    },
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
        <div className={getGraphNodeClassName(data.kind, data.highlighted)}>
            <Handle type="target" position={Position.Left} />
            <span className="mb-dp4 block text-[0.625rem] font-semibold uppercase leading-none tracking-wide text-dhis2-grey-600">
                {KIND_LABELS[data.kind]}
            </span>
            <div className="break-words font-semibold leading-[1.3]">{data.label}</div>
            {data.value !== undefined ? (
                <div className="mt-dp4 border-t border-dhis2-grey-200 pt-dp4 font-mono text-[0.6875rem] break-all text-dhis2-grey-700">
                    {data.value}
                </div>
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

export function toFlowGraph(
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
        const rawFieldId = node.kind === 'field' ? node.id.slice('field:'.length) : undefined;
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
                value: displayValue,
                highlighted: highlightedKeys ? highlightedKeys.has(node.id) : true,
            },
        };
    });

    const edges: Edge[] = graph.edges.map((edge) => {
        const isHighlighted = highlightedKeys
            ? highlightedKeys.has(edge.source) && highlightedKeys.has(edge.target)
            : true;
        const effectType = edge.effectType ?? 'default';
        const stroke = getEffectEdgeStroke(effectType, isHighlighted);

        return {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: 'smoothstep',
            label: getEffectShortLabel(effectType),
            animated: isHighlighted && effectType !== 'read',
            style: {
                stroke,
                strokeWidth: Math.min(1 + edge.fireCount, 4),
                opacity: isHighlighted ? 1 : 0.4,
            },
            labelStyle: {
                fill: stroke,
                fontWeight: 600,
                fontSize: 10,
            },
            labelBgStyle: {
                fill: '#ffffff',
                fillOpacity: 0.92,
            },
            labelShowBg: true,
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: stroke,
            },
        };
    });

    return { nodes, edges };
}

type GraphToolbarProps = {
    nodeCount: number;
    edgeCount: number;
    headerActions?: ReactNode;
    activeEffectVariants: ReadonlySet<EffectVisualVariant>;
};

function GraphToolbar({
    nodeCount,
    edgeCount,
    headerActions,
    activeEffectVariants,
}: GraphToolbarProps) {
    const items: Array<{ kind: GraphNode['kind']; label: string }> = [
        { kind: 'field', label: translate('Field') },
        { kind: 'rule', label: translate('Rule') },
        { kind: 'section', label: translate('Section') },
        { kind: 'feedback', label: translate('Feedback') },
    ];

    return (
        <div className="shrink-0 border-b border-dhis2-grey-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-dp8 px-dp12 py-dp8">
                <div
                    className="flex min-w-0 flex-wrap items-center gap-x-dp12 gap-y-dp8"
                    aria-hidden="true"
                >
                    {items.map((item) => (
                        <span
                            key={item.kind}
                            className="inline-flex items-center gap-dp8 text-xs text-dhis2-grey-800"
                        >
                            <span className={getLegendSwatchClassName(item.kind)} />
                            {item.label}
                        </span>
                    ))}
                </div>
                <div className="flex shrink-0 items-center gap-dp8">
                    <span className="text-xs tabular-nums text-dhis2-grey-600">
                        {translate('{{nodes}} nodes · {{edges}} edges', {
                            nodes: nodeCount,
                            edges: edgeCount,
                        })}
                    </span>
                    {headerActions}
                </div>
            </div>
            <EffectLegend activeVariants={activeEffectVariants} />
        </div>
    );
}

type RuleGraphCanvasProps = {
    nodes: Node<RuleNodeData>[];
    edges: Edge[];
    layoutKey?: string | number;
};

function FitViewOnChange({
    layoutKey,
    nodeCount,
    edgeCount,
}: {
    layoutKey?: string | number;
    nodeCount: number;
    edgeCount: number;
}) {
    const { fitView } = useReactFlow();

    useEffect(() => {
        const frameId = requestAnimationFrame(() => {
            void fitView({ padding: 0.15, duration: 150 });
        });
        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [edgeCount, fitView, layoutKey, nodeCount]);

    return null;
}

function RuleGraphCanvas({ nodes, edges, layoutKey }: RuleGraphCanvasProps) {
    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
            fitView
            proOptions={{ hideAttribution: true }}
            className="h-full w-full"
        >
            <FitViewOnChange
                layoutKey={layoutKey}
                nodeCount={nodes.length}
                edgeCount={edges.length}
            />
            <Background gap={16} size={1} />
            <Controls showInteractive={false} />
        </ReactFlow>
    );
}

export function RuleGraphView({
    entries,
    fieldState,
    formValues,
    selectedEntryId,
    highlightRuleId,
    labelLookup,
    className,
    layoutKey,
    headerActions,
    minHeightClassName = 'min-h-[360px]',
}: RuleGraphViewProps) {
    const graph = useMemo(() => buildGraphFromTrace(entries, labelLookup), [entries, labelLookup]);

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

    const activeEffectVariants = useMemo(() => {
        const variants = new Set<EffectVisualVariant>();
        for (const edge of graph.edges) {
            if (edge.effectType) {
                variants.add(getEffectVariant(edge.effectType));
            }
        }
        return variants;
    }, [graph.edges]);

    if (!graph.nodes.length) {
        return (
            <div className="p-dp8">
                <NoticeBox title={translate('No rule relationships yet')}>
                    {translate(
                        'Interact with the form to build the dependency graph. Only rules and effects that have fired during this session are shown. Connections flow Field → Rule → Target (read / effect).'
                    )}
                </NoticeBox>
            </div>
        );
    }

    return (
        <div
            className={`flex h-full min-h-[480px] flex-1 flex-col overflow-hidden rounded-md border border-dhis2-grey-200 bg-white ${className ?? ''}`}
        >
            <GraphToolbar
                nodeCount={graph.nodes.length}
                edgeCount={graph.edges.length}
                headerActions={headerActions}
                activeEffectVariants={activeEffectVariants}
            />
            <div
                className={`${minHeightClassName} flex-1 bg-white`}
                style={{ width: '100%', height: '100%' }}
            >
                <ReactFlowProvider>
                    <RuleGraphCanvas nodes={nodes} edges={edges} layoutKey={layoutKey} />
                </ReactFlowProvider>
            </div>
        </div>
    );
}
