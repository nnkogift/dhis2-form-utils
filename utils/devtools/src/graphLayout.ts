import type { GraphEdge, GraphNodeKind, RuleDependencyGraph } from './buildGraph';

export type GraphNodePosition = { x: number; y: number };

export type FlowGraphRole = 'source' | 'rule' | 'target';

/** A single visual node in the React Flow canvas (may differ from the semantic graph node). */
export type FlowGraphNode = {
    id: string;
    graphNodeId: string;
    kind: GraphNodeKind;
    label: string;
    role: FlowGraphRole;
};

export type PreparedFlowGraph = {
    nodes: FlowGraphNode[];
    edges: GraphEdge[];
};

/** Column x-coordinates by node role. Effect targets always sit to the right of rules. */
export const ROLE_COLUMNS: Record<FlowGraphRole, number> = {
    source: 0,
    rule: 280,
    target: 560,
};

/** Feedback targets get an extra column so they never overlap sections/field targets. */
export const FEEDBACK_COLUMN = 720;

/** Vertical distance between rule lanes. */
export const LANE_HEIGHT = 104;

/** Vertical spread applied to nodes that land in the same column and lane. */
const STAGGER = 24;

function median(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/** Centered spread: 0, +24, -24, +48, -48, … so a bucket fans out around its lane. */
function staggerOffset(indexInBucket: number): number {
    if (indexInBucket === 0) {
        return 0;
    }
    const magnitude = Math.ceil(indexInBucket / 2) * STAGGER;
    return indexInBucket % 2 === 1 ? magnitude : -magnitude;
}

function columnFor(node: FlowGraphNode): number {
    if (node.role === 'target' && node.kind === 'feedback') {
        return FEEDBACK_COLUMN;
    }
    return ROLE_COLUMNS[node.role];
}

/**
 * Expands the semantic graph into flow nodes so every edge runs left → right.
 * Fields that are both read sources and effect targets are split into `@src` /
 * `@tgt` copies at the source and target columns respectively.
 */
export function prepareFlowGraph(graph: RuleDependencyGraph): PreparedFlowGraph {
    const readSources = new Set<string>();
    const effectTargets = new Set<string>();

    for (const edge of graph.edges) {
        if (edge.effectType === 'read') {
            readSources.add(edge.source);
        } else {
            effectTargets.add(edge.target);
        }
    }

    const flowNodes: FlowGraphNode[] = [];
    const endpointByGraphId = new Map<string, { source?: string; target?: string }>();

    for (const node of graph.nodes) {
        if (node.kind === 'rule') {
            flowNodes.push({
                id: node.id,
                graphNodeId: node.id,
                kind: node.kind,
                label: node.label,
                role: 'rule',
            });
            continue;
        }

        const isSource = readSources.has(node.id);
        const isTarget = effectTargets.has(node.id);
        const endpoints: { source?: string; target?: string } = {};

        if (isSource) {
            const flowId = isTarget ? `${node.id}@src` : node.id;
            endpoints.source = flowId;
            flowNodes.push({
                id: flowId,
                graphNodeId: node.id,
                kind: node.kind,
                label: node.label,
                role: 'source',
            });
        }

        if (isTarget) {
            const flowId = isSource ? `${node.id}@tgt` : node.id;
            endpoints.target = flowId;
            flowNodes.push({
                id: flowId,
                graphNodeId: node.id,
                kind: node.kind,
                label: node.label,
                role: 'target',
            });
        }

        endpointByGraphId.set(node.id, endpoints);
    }

    const flowEdges = graph.edges.map((edge) => {
        if (edge.effectType === 'read') {
            const endpoints = endpointByGraphId.get(edge.source);
            return { ...edge, source: endpoints?.source ?? edge.source };
        }
        const endpoints = endpointByGraphId.get(edge.target);
        return { ...edge, target: endpoints?.target ?? edge.target };
    });

    return { nodes: flowNodes, edges: flowEdges };
}

/**
 * Rule-centric lane layout on flow nodes. Each rule owns one horizontal lane;
 * sources sit left, targets right, so every edge flows in the same direction.
 */
export function computeGraphLayout(
    flowNodes: FlowGraphNode[],
    flowEdges: GraphEdge[]
): Map<string, GraphNodePosition> {
    const positions = new Map<string, GraphNodePosition>();

    const ruleLane = new Map<string, number>();
    flowNodes
        .filter((node) => node.role === 'rule')
        .forEach((node, index) => {
            ruleLane.set(node.id, index);
            positions.set(node.id, { x: ROLE_COLUMNS.rule, y: index * LANE_HEIGHT });
        });

    const connectedRuleLanes = new Map<string, Set<number>>();
    const addLane = (nodeId: string, lane: number) => {
        const lanes = connectedRuleLanes.get(nodeId) ?? new Set<number>();
        lanes.add(lane);
        connectedRuleLanes.set(nodeId, lanes);
    };

    for (const edge of flowEdges) {
        const sourceLane = ruleLane.get(edge.source);
        const targetLane = ruleLane.get(edge.target);
        if (targetLane !== undefined && sourceLane === undefined) {
            addLane(edge.source, targetLane);
        }
        if (sourceLane !== undefined && targetLane === undefined) {
            addLane(edge.target, sourceLane);
        }
    }

    const bucketCounts = new Map<string, number>();
    for (const node of flowNodes) {
        if (node.role === 'rule') {
            continue;
        }
        const lanes = connectedRuleLanes.get(node.id);
        const lane = lanes && lanes.size > 0 ? median([...lanes]) : 0;
        const column = columnFor(node);
        const bucketKey = `${String(column)}:${String(lane)}`;
        const indexInBucket = bucketCounts.get(bucketKey) ?? 0;
        bucketCounts.set(bucketKey, indexInBucket + 1);
        positions.set(node.id, {
            x: column,
            y: lane * LANE_HEIGHT + staggerOffset(indexInBucket),
        });
    }

    return positions;
}

/** @deprecated Use ROLE_COLUMNS.source */
export const KIND_COLUMNS = {
    field: ROLE_COLUMNS.source,
    rule: ROLE_COLUMNS.rule,
    section: ROLE_COLUMNS.target,
    feedback: FEEDBACK_COLUMN,
} as const;
