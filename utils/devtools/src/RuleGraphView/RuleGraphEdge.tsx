import {
    BaseEdge,
    type Edge,
    type EdgeProps,
    EdgeLabelRenderer,
    getSmoothStepPath,
} from '@xyflow/react';
import { memo, useState } from 'react';
import type { RuleGraphEdgeData } from './types';

// fallow-ignore-next-line complexity
function RuleGraphEdgeComponent({
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

export const edgeTypes = {
    ruleGraphEdge: memo(RuleGraphEdgeComponent),
};
