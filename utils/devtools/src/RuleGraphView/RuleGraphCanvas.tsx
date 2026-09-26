import {
    Background,
    Controls,
    type Edge,
    MarkerType,
    type Node,
    ReactFlow,
    useEdgesState,
    useNodesState,
} from '@xyflow/react';
import { useEffect } from 'react';
import { getEffectEdgeStroke } from '../effectStyles';
import { edgeTypes } from './RuleGraphEdge';
import { nodeTypes } from './RuleGraphNode';
import type { RuleGraphEdgeData, RuleNodeData } from './types';
import { FitViewOnChange } from './FitViewOnChange';

const DEFAULT_EDGE_OPTIONS = {
    type: 'ruleGraphEdge' as const,
    style: { stroke: getEffectEdgeStroke('default') },
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: getEffectEdgeStroke('default'),
    },
};

type RuleGraphCanvasProps = {
    nodes: Node<RuleNodeData>[];
    edges: Edge<RuleGraphEdgeData>[];
    layoutKey?: string | number;
};

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

export function RuleGraphCanvas({
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
