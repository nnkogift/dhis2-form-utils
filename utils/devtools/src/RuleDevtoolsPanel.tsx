import { Button, Tab, TabBar } from '@dhis2/ui';
import { translate } from './i18n';
import type { RuleTraceEntry } from '@dhis2-form-utils/hooks';
import { useFormStateContext, useFormStore } from '@dhis2-form-utils/hooks';
import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { createLabelLookup, type RuleDevtoolsMetadata } from './createLabelLookup';
import { useRuleTraceStore } from './RuleDevtoolsScope';
import { formatAgo } from './formatAgo';
import { RuleGraphView } from './RuleGraphView';
import { TraceTimeline } from './TraceTimeline';

export type { RuleDevtoolsMetadata } from './createLabelLookup';

export type RuleDevtoolsPanelProps = {
    metadata?: RuleDevtoolsMetadata;
};

type DevtoolsTab = 'trace' | 'graph';

function countObservedRules(entries: readonly RuleTraceEntry[]): number {
    const ruleIds = new Set<string>();
    for (const entry of entries) {
        for (const result of entry.ruleResults) {
            ruleIds.add(result.ruleId);
        }
    }
    return ruleIds.size;
}

export function RuleDevtoolsPanel({ metadata }: RuleDevtoolsPanelProps) {
    const formStore = useFormStore();
    const { form } = useFormStateContext();
    const traceStore = useRuleTraceStore();
    const labelLookup = useMemo(
        () => (metadata ? createLabelLookup(metadata) : undefined),
        [metadata]
    );
    const [tab, setTab] = useState<DevtoolsTab>('trace');
    const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
    const [highlightRuleId, setHighlightRuleId] = useState<string | null>(null);

    const entries = useSyncExternalStore(
        useCallback((listener) => traceStore.subscribe(listener), [traceStore]),
        useCallback(() => traceStore.getSnapshot(), [traceStore]),
        useCallback(() => traceStore.getSnapshot(), [traceStore])
    );

    const fieldState = useSyncExternalStore(
        useCallback((listener) => formStore.fieldStore.subscribeAll(listener), [formStore]),
        useCallback(() => formStore.fieldStore.getSnapshot(), [formStore]),
        useCallback(() => formStore.fieldStore.getSnapshot(), [formStore])
    );

    const selectedEntry = useMemo(
        () => entries.find((entry) => entry.id === selectedEntryId) ?? null,
        [entries, selectedEntryId]
    );

    const observedRuleCount = useMemo(() => countObservedRules(entries), [entries]);
    const highlightedRuleName = useMemo(() => {
        if (!highlightRuleId) {
            return null;
        }
        return labelLookup?.resolveRuleName(highlightRuleId) ?? highlightRuleId;
    }, [highlightRuleId, labelLookup]);

    return (
        <aside
            className={`flex w-[420px] min-w-[320px] max-w-[min(92vw,560px)] h-full flex-col bg-dhis2-grey-100 border-s border-dhis2-grey-300`}
            aria-label={translate('Rule devtools')}
        >
            <header className="flex shrink-0 items-start justify-between gap-dp12 border-b border-dhis2-grey-200 bg-white px-dp16 pt-dp16 pb-dp12">
                <div className="flex min-w-0 flex-col gap-dp4">
                    <div className="flex items-center gap-dp8">
                        <span
                            className="size-2 shrink-0 rounded-full bg-dhis2-teal-600"
                            aria-hidden="true"
                        />
                        <h2 className="m-0 text-base font-bold leading-[1.35] text-dhis2-grey-900">
                            {translate('Rule devtools')}
                        </h2>
                    </div>
                    <p className="m-0 text-[0.8125rem] leading-normal text-dhis2-grey-700">
                        {entries.length
                            ? translate('{{evaluations}} evaluations · {{rules}} rules observed', {
                                  evaluations: entries.length,
                                  rules: observedRuleCount,
                              })
                            : translate(
                                  'Interact with the form to record rule evaluations. Only fired rules appear here.'
                              )}
                    </p>
                </div>
            </header>

            <div className="shrink-0 border-b border-dhis2-grey-200 bg-white px-dp16">
                <TabBar>
                    <Tab
                        selected={tab === 'trace'}
                        onClick={() => {
                            setTab('trace');
                        }}
                    >
                        {translate('Trace')}
                    </Tab>
                    <Tab
                        selected={tab === 'graph'}
                        onClick={() => {
                            setTab('graph');
                        }}
                    >
                        {translate('Graph')}
                    </Tab>
                </TabBar>
            </div>

            {selectedEntry || highlightedRuleName ? (
                <div className="mx-dp16 mt-dp12 flex shrink-0 items-center justify-between gap-dp12 rounded border border-dhis2-teal-400 bg-dhis2-teal-050 p-dp12 text-[0.8125rem] leading-[1.45] text-dhis2-grey-900">
                    <span className="min-w-0">
                        {selectedEntry
                            ? translate('Highlighting evaluation {{time}}', {
                                  time: formatAgo(selectedEntry.timestamp),
                              })
                            : null}
                        {selectedEntry && highlightedRuleName ? ' · ' : null}
                        {highlightedRuleName
                            ? translate('Rule: {{name}}', { name: highlightedRuleName })
                            : null}
                    </span>
                    <Button
                        small
                        onClick={() => {
                            setSelectedEntryId(null);
                            setHighlightRuleId(null);
                        }}
                    >
                        {translate('Clear')}
                    </Button>
                </div>
            ) : null}

            <div className="min-h-0 flex-1 overflow-auto bg-dhis2-grey-050 p-dp16">
                {tab === 'trace' ? (
                    <TraceTimeline
                        entries={entries}
                        selectedEntryId={selectedEntryId}
                        highlightRuleId={highlightRuleId}
                        onSelectEntry={(entryId) => {
                            setSelectedEntryId((current) => (current === entryId ? null : entryId));
                        }}
                        onHighlightRule={(ruleId) => {
                            setHighlightRuleId(ruleId);
                            if (ruleId) {
                                setTab('graph');
                            }
                        }}
                        labelLookup={labelLookup}
                    />
                ) : (
                    <RuleGraphView
                        entries={entries}
                        fieldState={fieldState}
                        formValues={form.getValues()}
                        selectedEntryId={selectedEntryId}
                        highlightRuleId={highlightRuleId}
                        labelLookup={labelLookup}
                    />
                )}
            </div>
        </aside>
    );
}
