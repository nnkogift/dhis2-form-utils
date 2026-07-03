import { Button, IconChevronLeft24, IconChevronRight24, Tab, TabBar } from '@dhis2/ui';
import { translate } from './i18n';
import { useFormStateContext, useFormStore } from '@dhis2-form-utils/hooks';
import type { RuleTraceEntry } from '@dhis2-form-utils/hooks';
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { attachRuleDevtools } from './attach';
import { formatAgo } from './formatAgo';
import { RuleGraphView } from './RuleGraphView';
import { TraceTimeline } from './TraceTimeline';

export type RuleDevtoolsPanelProps = {
    resolveRuleName?: (ruleId: string) => string | undefined;
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

export function RuleDevtoolsPanel({ resolveRuleName }: RuleDevtoolsPanelProps) {
    const formStore = useFormStore();
    const { form } = useFormStateContext();
    const traceStore = useMemo(() => attachRuleDevtools(formStore), [formStore]);
    const [open, setOpen] = useState(true);
    const [tab, setTab] = useState<DevtoolsTab>('trace');
    const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
    const [highlightRuleId, setHighlightRuleId] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            traceStore.dispose();
        };
    }, [traceStore]);

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
        return resolveRuleName?.(highlightRuleId) ?? highlightRuleId;
    }, [highlightRuleId, resolveRuleName]);

    return (
        <div
            className={`fixed inset-y-0 end-0 z-[1000] h-full pointer-events-none ${
                open ? 'pointer-events-auto' : ''
            }`}
        >
            {!open ? (
                <button
                    type="button"
                    className="absolute top-1/2 end-0 -translate-y-1/2 pointer-events-auto flex items-center justify-center w-8 min-h-[72px] py-dp8 border border-dhis2-grey-300 border-e-0 rounded-s bg-white text-dhis2-grey-800 cursor-pointer shadow-[-2px_0_12px_rgb(0_0_0/10%)] hover:bg-dhis2-grey-100 focus-visible:outline-2 focus-visible:outline-dhis2-teal-600 focus-visible:outline-offset-2"
                    aria-label={translate('Open rule devtools')}
                    onClick={() => {
                        setOpen(true);
                    }}
                >
                    <IconChevronLeft24 />
                </button>
            ) : null}

            <aside
                className={`absolute inset-y-0 end-0 flex w-[420px] min-w-[320px] max-w-[min(92vw,560px)] resize-x flex-col overflow-hidden bg-dhis2-grey-050 border-s border-dhis2-grey-300 shadow-[-4px_0_24px_rgb(0_0_0/12%)] transition-transform duration-[220ms] ease-out motion-reduce:transition-none ${
                    open ? 'translate-x-0' : 'translate-x-full'
                }`}
                aria-label={translate('Rule devtools')}
                aria-hidden={!open}
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
                                ? translate(
                                      '{{evaluations}} evaluations · {{rules}} rules observed',
                                      {
                                          evaluations: entries.length,
                                          rules: observedRuleCount,
                                      }
                                  )
                                : translate(
                                      'Interact with the form to record rule evaluations. Only fired rules appear here.'
                                  )}
                        </p>
                    </div>
                    <Button
                        small
                        secondary
                        icon={<IconChevronRight24 />}
                        aria-label={translate('Hide rule devtools')}
                        onClick={() => {
                            setOpen(false);
                        }}
                    />
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
                                setSelectedEntryId((current) =>
                                    current === entryId ? null : entryId
                                );
                            }}
                            onHighlightRule={(ruleId) => {
                                setHighlightRuleId(ruleId);
                                if (ruleId) {
                                    setTab('graph');
                                }
                            }}
                            resolveRuleName={resolveRuleName}
                        />
                    ) : (
                        <RuleGraphView
                            entries={entries}
                            fieldState={fieldState}
                            formValues={form.getValues()}
                            selectedEntryId={selectedEntryId}
                            highlightRuleId={highlightRuleId}
                            resolveRuleName={resolveRuleName}
                        />
                    )}
                </div>
            </aside>
        </div>
    );
}
