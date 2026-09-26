import { ReactFlowProvider } from '@xyflow/react';
import { NoticeBox } from '@dhis2/ui';
import { useMemo } from 'react';
import { buildGraphFromTrace } from '../../graph/buildGraph';
import { getEffectVariant, type EffectVisualVariant } from '../../styles/effectStyles';
import { translate } from '../../i18n/index';
import { resolveGraphTraceEntry } from '../../lib/traceEntry';
import { GraphToolbar } from './GraphToolbar';
import { RuleGraphCanvas } from './RuleGraphCanvas';
import { entryGraphKeys, ruleGraphKeys, toFlowGraph } from './graphHelpers';
import type { RuleGraphViewProps } from './types';

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

    // fallow-ignore-next-line complexity
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
