import type { GraphNode } from './buildGraph';

const GRAPH_NODE_CLASSES: Record<GraphNode['kind'], string> = {
    field: 'border-dhis2-blue-500',
    rule: 'border-dhis2-teal-600 bg-dhis2-teal-050',
    section: 'border-dhis2-grey-600',
    feedback: 'border-dhis2-purple-500',
};

const LEGEND_SWATCH_CLASSES: Record<GraphNode['kind'], string> = {
    field: 'bg-dhis2-blue-500',
    rule: 'bg-dhis2-teal-600',
    section: 'bg-dhis2-grey-600',
    feedback: 'bg-dhis2-purple-500',
};

export function getGraphNodeClassName(kind: GraphNode['kind'], highlighted: boolean): string {
    return `p-dp8 rounded border bg-white min-w-28 max-w-[180px] text-xs shadow-[0_1px_2px_rgb(0_0_0/6%)] transition-opacity duration-150 ease-out ${GRAPH_NODE_CLASSES[kind]} ${
        highlighted ? '' : 'opacity-35'
    }`;
}

export function getLegendSwatchClassName(kind: GraphNode['kind']): string {
    return `size-2.5 shrink-0 rounded-sm ${LEGEND_SWATCH_CLASSES[kind]}`;
}
