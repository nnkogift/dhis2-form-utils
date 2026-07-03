import { Button, IconChevronLeft24, IconChevronRight24, Tab, TabBar } from '@dhis2/ui';
import { translate } from './i18n';
import { useFormStateContext, useFormStore } from '@dhis2-form-utils/hooks';
import type { RuleTraceEntry } from '@dhis2-form-utils/hooks';
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { attachRuleDevtools } from './attach';
import './devtools.css';
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
            className={`rule-devtools-drawer-shell ${
                open ? 'rule-devtools-drawer-shell--open' : ''
            }`}
        >
            {!open ? (
                <button
                    type="button"
                    className="rule-devtools-edge-toggle"
                    aria-label={translate('Open rule devtools')}
                    onClick={() => {
                        setOpen(true);
                    }}
                >
                    <IconChevronLeft24 />
                </button>
            ) : null}

            <aside
                className="rule-devtools-drawer"
                aria-label={translate('Rule devtools')}
                aria-hidden={!open}
            >
                <header className="rule-devtools-header">
                    <div className="rule-devtools-header-text">
                        <div className="rule-devtools-title-row">
                            <span className="rule-devtools-status-dot" aria-hidden="true" />
                            <h2 className="rule-devtools-title">{translate('Rule devtools')}</h2>
                        </div>
                        <p className="rule-devtools-subtitle">
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

                <div className="rule-devtools-tabs">
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
                    <div className="rule-devtools-selection-bar">
                        <span className="rule-devtools-selection-text">
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

                <div className="rule-devtools-body">
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
