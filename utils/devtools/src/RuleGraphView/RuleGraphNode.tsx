import { type Node, type NodeProps, Handle, Position } from '@xyflow/react';
import { memo } from 'react';
import { getGraphNodeClassName } from '../graphNodeStyles';
import { KIND_LABELS, type RuleNodeData } from './types';

function RuleGraphNodeComponent({ data }: NodeProps<Node<RuleNodeData>>) {
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

export const nodeTypes = {
    ruleGraphNode: memo(RuleGraphNodeComponent),
};
