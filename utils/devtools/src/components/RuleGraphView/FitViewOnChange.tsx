import { useReactFlow } from '@xyflow/react';
import { useEffect } from 'react';

const FIT_VIEW_PADDING = 0.2;
const FIT_VIEW_DURATION_MS = 150;

export function FitViewOnChange({
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
            void fitView({ padding: FIT_VIEW_PADDING, duration: FIT_VIEW_DURATION_MS });
        });
        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [edgeCount, fitView, layoutKey, nodeCount]);

    return null;
}
