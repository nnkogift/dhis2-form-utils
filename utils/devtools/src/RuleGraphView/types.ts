import type { ReactNode } from 'react';
import type { RuleTraceEntry, FormStore } from '@nnkogift/dhis2-form-utils-hooks';
import type { GraphNode } from '../buildGraph';
import type { DevtoolsLabelLookup } from '../createLabelLookup';

export type FieldStateMap = ReturnType<FormStore['fieldStore']['getSnapshot']>;

export type RuleNodeData = {
    label: string;
    kind: GraphNode['kind'];
    graphNodeId: string;
    value?: string;
    highlighted: boolean;
};

export type RuleGraphEdgeData = {
    label: string;
    stroke: string;
    /** When false, the label is hidden on the canvas and shown only on hover. */
    showLabel: boolean;
    /** Per-source fan-out distance so parallel edges don't overlap. */
    offset: number;
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

export const KIND_LABELS: Record<GraphNode['kind'], string> = {
    field: 'Field',
    rule: 'Rule',
    section: 'Section',
    feedback: 'Feedback',
};

/**
 * Above this edge count, low-signal `read` labels are dropped from the canvas
 * and shown on hover instead. They stay documented in the toolbar legend.
 */
export const READ_LABEL_EDGE_THRESHOLD = 4;
