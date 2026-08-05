import { memo, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
    Background,
    BaseEdge,
    Controls,
    EdgeLabelRenderer,
    type Edge,
    type EdgeProps,
    getSmoothStepPath,
    Handle,
    MarkerType,
    type Node,
    type NodeProps,
    Position,
    ReactFlow,
    ReactFlowProvider,
    useEdgesState,
    useNodesState,
    useReactFlow,
} from '@xyflow/react';
import { NoticeBox } from '@dhis2/ui';
import type { RuleTraceEntry } from '@nnkogift/dhis2-form-utils-hooks';
import type { FormStore } from '@nnkogift/dhis2-form-utils-hooks';
import { buildGraphFromTrace, type GraphNode, type RuleDependencyGraph } from './buildGraph';
import { computeGraphLayout, prepareFlowGraph } from './graphLayout';
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
import { resolveGraphTraceEntry } from './traceEntry';

type FieldStateMap = ReturnType<FormStore['fieldStore']['getSnapshot']>;

type RuleNodeData = {
    label: string;
    kind: GraphNode['kind'];
    graphNodeId: string;
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

const KIND_LABELS: Record<GraphNode['kind'], string> = {
    field: 'Field',
    rule: 'Rule',
    section: 'Section',
    feedback: 'Feedback',
};

/**
 * Above this edge count, low-signal `read` labels are dropped from the canvas
 * and shown on hover instead. They stay documented in the toolbar legend.
 */
const READ_LABEL_EDGE_THRESHOLD = 4;

const DEFAULT_EDGE_OPTIONS = {
    type: 'ruleGraphEdge' as const,
    style: { stroke: getEffectEdgeStroke('default') },
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: getEffectEdgeStroke('default'),
    },
};

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

type RuleGraphEdgeData = {
    label: string;
    stroke: string;
    /** When false, the label is hidden on the canvas and shown only on hover. */
    showLabel: boolean;
    /** Per-source fan-out distance so parallel edges don't overlap. */
    offset: number;
};

function RuleGraphEdge({
    id,
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    markerEnd,
    style,
    data,
}: EdgeProps<Edge<RuleGraphEdgeData>>) {
    const [hovered, setHovered] = useState(false);
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        offset: data?.offset ?? 20,
    });

    const showLabel = data ? data.showLabel || hovered : false;

    return (
        <>
            <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
            <path
                d={edgePath}
                fill="none"
                stroke="transparent"
                strokeWidth={16}
                onMouseEnter={() => {
                    setHovered(true);
                }}
                onMouseLeave={() => {
                    setHovered(false);
                }}
            />
            {showLabel && data ? (
                <EdgeLabelRenderer>
                    <div
                        className="nodrag nopan absolute rounded-sm px-dp4 text-[10px] font-semibold"
                        style={{
                            transform: `translate(-50%, -50%) translate(${String(labelX)}px, ${String(labelY)}px)`,
                            background: 'rgba(255,255,255,0.92)',
                            color: data.stroke,
                            pointerEvents: 'all',
                        }}
                        onMouseEnter={() => {
                            setHovered(true);
                        }}
                        onMouseLeave={() => {
                            setHovered(false);
                        }}
                    >
                        {data.label}
                    </div>
                </EdgeLabelRenderer>
            ) : null}
        </>
    );
}

const edgeTypes = {
    ruleGraphEdge: memo(RuleGraphEdge),
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

function ruleGraphKeys(entry: RuleTraceEntry, ruleId: string): Set<string> {
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
    edges: Edge<RuleGraphEdgeData>[];
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
            void fitView({ padding: 0.2, duration: 150 });
        });
        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [edgeCount, fitView, layoutKey, nodeCount]);

    return null;
}

function mergeNodePositions(
    next: Node<RuleNodeData>[],
    current: Node<RuleNodeData>[]
): Node<RuleNodeData>[] {
    const currentById = new Map(current.map((node) => [node.id, node]));
    return next.map((node) => {
        const existing = currentById.get(node.id);
        if (existing) {
            return { ...node, position: existing.position };
        }
        return node;
    });
}

function RuleGraphCanvas({
    nodes: layoutNodes,
    edges: layoutEdges,
    layoutKey,
}: RuleGraphCanvasProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);

    useEffect(() => {
        setNodes((current) => mergeNodePositions(layoutNodes, current));
    }, [layoutNodes, setNodes]);

    useEffect(() => {
        setEdges(layoutEdges);
    }, [layoutEdges, setEdges]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodesDraggable
            defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
            elevateEdgesOnSelect
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
    const graphEntry = useMemo(
        () => resolveGraphTraceEntry(entries, selectedEntryId),
        [entries, selectedEntryId]
    );

    const graph = useMemo(
        () =>
            graphEntry ? buildGraphFromTrace([graphEntry], labelLookup) : { nodes: [], edges: [] },
        [graphEntry, labelLookup]
    );

    const highlightedKeys = useMemo(() => {
        if (!graphEntry || (!selectedEntryId && !highlightRuleId)) {
            return null;
        }

        const keys = new Set<string>();

        if (selectedEntryId) {
            for (const key of entryGraphKeys(graphEntry)) {
                keys.add(key);
            }
        }

        if (highlightRuleId) {
            for (const key of ruleGraphKeys(graphEntry, highlightRuleId)) {
                keys.add(key);
            }
        }

        return keys;
    }, [graphEntry, highlightRuleId, selectedEntryId]);

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
                        'Interact with the form to build the dependency graph. Only rules active in the latest evaluation are shown. Select a trace entry to inspect a past evaluation. Connections flow Field → Rule → Target (read / effect).'
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
