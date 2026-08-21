import { Button, IconFullscreen16, IconInfo16, SegmentedControl } from '@dhis2/ui';
import type { RuleTraceEntry } from '@nnkogift/dhis2-form-utils-hooks';
import { useFormStateContext, useFormStore } from '@nnkogift/dhis2-form-utils-hooks';
import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { buildGraphFromTrace } from './buildGraph';
import { createLabelLookup, type RuleDevtoolsMetadata } from './createLabelLookup';
import { EffectBadge } from './EffectBadge';
import { formatAgo } from './formatAgo';
import { formatRuleActionSummary } from './formatRuleActionSummary';
import { translate } from './i18n';
import type { CatalogRule } from './resolveProgramRulesList';
import { resolveProgramRulesList } from './resolveProgramRulesList';
import { useRuleTraceStore } from './RuleDevtoolsScope';
import { RuleDetailsModal, type RuleDetailsStatus } from './RuleDetailsModal';
import { RuleGraphModal } from './RuleGraphModal';
import { RuleGraphView } from './RuleGraphView';
import { TraceTimeline } from './TraceTimeline';
import { getActiveRuleIds, resolveGraphTraceEntry } from './traceEntry';

export type { RuleDevtoolsMetadata } from './createLabelLookup';

export type RulesPanelProps = {
    metadata: RuleDevtoolsMetadata;
    /** Show each rule's raw condition expression in the Rules tab. Defaults to true. */
    showConditions?: boolean;
};

type DevtoolsTab = 'rules' | 'trace' | 'graph';

type RuleScopeFilter = 'scoped' | 'all';

type RuleCardStatus = {
    label: string;
    className: string;
};

function resolveScopeStageId(metadata: RuleDevtoolsMetadata): string | null {
    return metadata.formKind === 'event' ? metadata.programStageId : null;
}

function isRuleInScope(rule: CatalogRule, scopeStageId: string | null): boolean {
    return rule.programStageId === null || rule.programStageId === scopeStageId;
}

function resolveAccentClassName(inScope: boolean, firing: boolean, selected: boolean): string {
    if (selected) {
        return 'bg-dhis2-blue-600';
    }
    if (!inScope) {
        return 'bg-transparent';
    }
    return firing ? 'bg-dhis2-teal-600' : 'bg-dhis2-grey-400';
}

function resolveCardStatus(inScope: boolean, firing: boolean): RuleCardStatus {
    if (!inScope) {
        return { label: translate('Out of scope'), className: 'text-dhis2-grey-500' };
    }
    return firing
        ? { label: translate('Firing'), className: 'text-dhis2-teal-700' }
        : { label: translate('Idle'), className: 'text-dhis2-grey-600' };
}

function resolveDetailsStatus(inScope: boolean, firing: boolean): RuleDetailsStatus {
    if (!inScope) {
        return 'out-of-scope';
    }
    return firing ? 'firing' : 'idle';
}

function formatActionLabel(action: ReturnType<typeof formatRuleActionSummary>): string {
    if (action.targetLabel && action.detail) {
        return `${action.type} · ${action.targetLabel} = ${action.detail}`;
    }
    if (action.targetLabel) {
        return `${action.type} · ${action.targetLabel}`;
    }
    return action.type;
}

function countObservedRules(entries: readonly RuleTraceEntry[]): number {
    const ruleIds = new Set<string>();
    for (const entry of entries) {
        for (const result of entry.ruleResults) {
            ruleIds.add(result.ruleId);
        }
    }
    return ruleIds.size;
}

const PANEL_TAB_KEYS: DevtoolsTab[] = ['rules', 'trace', 'graph'];

const SCOPE_FILTER_OPTIONS = [
    { label: translate('In scope'), value: 'scoped' satisfies RuleScopeFilter },
    { label: translate('All'), value: 'all' satisfies RuleScopeFilter },
];

function resolveTabLabel(key: DevtoolsTab): string {
    switch (key) {
        case 'rules':
            return translate('Rules');
        case 'trace':
            return translate('Trace');
        case 'graph':
            return translate('Graph');
    }
}

export function RulesPanel({ metadata, showConditions = true }: RulesPanelProps) {
    const formStore = useFormStore();
    const { form } = useFormStateContext();
    const traceStore = useRuleTraceStore();

    const [tab, setTab] = useState<DevtoolsTab>('rules');
    const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
    const [highlightRuleId, setHighlightRuleId] = useState<string | null>(null);
    const [graphModalOpen, setGraphModalOpen] = useState(false);
    const [scopeFilter, setScopeFilter] = useState<RuleScopeFilter>('scoped');
    const [detailsRuleId, setDetailsRuleId] = useState<string | null>(null);

    const labelLookup = useMemo(() => createLabelLookup(metadata), [metadata]);
    const catalog = useMemo(() => resolveProgramRulesList(metadata), [metadata]);
    const scopeStageId = useMemo(() => resolveScopeStageId(metadata), [metadata]);

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

    const activeRuleIds = useMemo(() => getActiveRuleIds(entries), [entries]);
    const scopedRules = useMemo(
        () => catalog.filter((rule) => isRuleInScope(rule, scopeStageId)),
        [catalog, scopeStageId]
    );
    const firingCount = useMemo(
        () => scopedRules.filter((rule) => activeRuleIds.has(rule.id)).length,
        [scopedRules, activeRuleIds]
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
        return labelLookup.resolveRuleName(highlightRuleId);
    }, [highlightRuleId, labelLookup]);

    const graphHasNodes = useMemo(() => {
        const entry = resolveGraphTraceEntry(entries, selectedEntryId);
        return entry ? buildGraphFromTrace([entry], labelLookup).nodes.length > 0 : false;
    }, [entries, labelLookup, selectedEntryId]);

    const graphSubtitle = useMemo(() => {
        if (selectedEntry && highlightedRuleName) {
            return translate('Highlighting evaluation {{time}} · Rule: {{name}}', {
                time: formatAgo(selectedEntry.timestamp),
                name: highlightedRuleName,
            });
        }
        if (selectedEntry) {
            return translate('Highlighting evaluation {{time}}', {
                time: formatAgo(selectedEntry.timestamp),
            });
        }
        if (highlightedRuleName) {
            return translate('Rule: {{name}}', { name: highlightedRuleName });
        }
        return null;
    }, [highlightedRuleName, selectedEntry]);

    const detailsRule = useMemo(
        () => catalog.find((rule) => rule.id === detailsRuleId) ?? null,
        [catalog, detailsRuleId]
    );
    const detailsStatus = detailsRule
        ? resolveDetailsStatus(
              isRuleInScope(detailsRule, scopeStageId),
              activeRuleIds.has(detailsRule.id)
          )
        : 'idle';
    const detailsProgramStageName = detailsRule
        ? detailsRule.programStageId === null
            ? null
            : labelLookup.resolveStageName(detailsRule.programStageId)
        : undefined;

    const graphProps = {
        entries,
        fieldState,
        formValues: form.getValues(),
        selectedEntryId,
        highlightRuleId,
        labelLookup,
    };

    const expandGraphButton = (
        <button
            type="button"
            className="inline-flex size-11 min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center rounded border border-dhis2-grey-300 bg-white text-dhis2-grey-800 hover:bg-dhis2-grey-100 focus-visible:outline-2 focus-visible:outline-dhis2-teal-600 focus-visible:outline-offset-1"
            aria-label={translate('Open graph in full screen')}
            onClick={() => {
                setGraphModalOpen(true);
            }}
        >
            <IconFullscreen16 />
        </button>
    );

    return (
        <aside
            className="flex h-full w-[404px] min-w-[320px] max-w-[min(92vw,480px)] flex-col border-s border-dhis2-grey-400 bg-dhis2-grey-100"
            aria-label={translate('Rules')}
        >
            <header className="shrink-0 border-b border-dhis2-grey-200 bg-white px-dp16 pt-dp12">
                <div className="flex items-center justify-between gap-dp12 pb-[10px]">
                    <div className="flex items-center gap-dp8">
                        <span
                            className="size-2 shrink-0 rounded-full bg-dhis2-teal-600"
                            aria-hidden="true"
                        />
                        <h2 className="m-0 text-base font-bold leading-[1.35] text-dhis2-grey-900">
                            {translate('Rules')}
                        </h2>
                    </div>
                    <div className="flex shrink-0 items-center gap-dp8">
                        <span className="text-xs text-dhis2-grey-600">
                            {translate('{{scoped}} in scope · {{firing}} firing', {
                                scoped: scopedRules.length,
                                firing: firingCount,
                            })}
                        </span>
                        <SegmentedControl
                            options={SCOPE_FILTER_OPTIONS}
                            selected={scopeFilter}
                            onChange={({ value }) => {
                                setScopeFilter(value as RuleScopeFilter);
                            }}
                        />
                    </div>
                </div>
                <div className="flex">
                    {PANEL_TAB_KEYS.map((key) => (
                        <button
                            key={key}
                            type="button"
                            className={`cursor-pointer border-0 border-b-[3px] bg-transparent px-dp12 py-dp8 text-sm font-medium ${
                                tab === key
                                    ? 'border-b-dhis2-blue-600 text-dhis2-blue-600'
                                    : 'border-b-transparent text-dhis2-grey-700'
                            }`}
                            onClick={() => {
                                setTab(key);
                            }}
                        >
                            {resolveTabLabel(key)}
                        </button>
                    ))}
                </div>
            </header>

            {tab !== 'rules' && (selectedEntry || highlightedRuleName) ? (
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

            <div className="min-h-0 flex-1 overflow-auto p-dp16">
                {tab === 'rules' ? (
                    <RulesTab
                        catalog={catalog}
                        scopeStageId={scopeStageId}
                        scopeFilter={scopeFilter}
                        activeRuleIds={activeRuleIds}
                        selectedRuleId={highlightRuleId}
                        showConditions={showConditions}
                        labelLookup={labelLookup}
                        onSelectRule={(ruleId) => {
                            setHighlightRuleId(ruleId);
                            setTab('graph');
                        }}
                        onOpenDetails={(ruleId) => {
                            setDetailsRuleId(ruleId);
                        }}
                    />
                ) : tab === 'trace' ? (
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
                        {...graphProps}
                        headerActions={graphHasNodes ? expandGraphButton : undefined}
                    />
                )}
            </div>

            {entries.length > 0 && tab !== 'rules' ? (
                <p className="sr-only" aria-live="polite">
                    {translate('{{evaluations}} evaluations · {{rules}} rules observed', {
                        evaluations: entries.length,
                        rules: observedRuleCount,
                    })}
                </p>
            ) : null}

            <RuleGraphModal
                {...graphProps}
                open={graphModalOpen}
                onClose={() => {
                    setGraphModalOpen(false);
                }}
                subtitle={graphSubtitle}
                layoutKey={graphModalOpen ? 'open' : 'closed'}
            />

            <RuleDetailsModal
                open={detailsRuleId != null}
                onClose={() => {
                    setDetailsRuleId(null);
                }}
                ruleId={detailsRuleId}
                ruleName={detailsRule?.name ?? ''}
                status={detailsStatus}
                programStageName={detailsProgramStageName}
                programRuleVariables={metadata.metadata.programRuleVariables}
            />
        </aside>
    );
}

type RulesTabProps = {
    catalog: CatalogRule[];
    scopeStageId: string | null;
    scopeFilter: RuleScopeFilter;
    activeRuleIds: ReadonlySet<string>;
    selectedRuleId: string | null;
    showConditions: boolean;
    labelLookup: ReturnType<typeof createLabelLookup>;
    onSelectRule: (ruleId: string) => void;
    onOpenDetails: (ruleId: string) => void;
};

function RulesTab({
    catalog,
    scopeStageId,
    scopeFilter,
    activeRuleIds,
    selectedRuleId,
    showConditions,
    labelLookup,
    onSelectRule,
    onOpenDetails,
}: RulesTabProps) {
    if (!catalog.length) {
        return (
            <p className="m-0 text-sm leading-normal text-dhis2-grey-600">
                {translate('This program has no rules.')}
            </p>
        );
    }

    const visibleRules =
        scopeFilter === 'all'
            ? catalog
            : catalog.filter((rule) => isRuleInScope(rule, scopeStageId));

    if (!visibleRules.length) {
        return (
            <p className="m-0 text-sm leading-normal text-dhis2-grey-600">
                {translate('No rules are in scope for this stage.')}
            </p>
        );
    }

    return (
        <ul className="m-0 flex list-none flex-col gap-[10px] p-0">
            {visibleRules.map((rule) => {
                const inScope = isRuleInScope(rule, scopeStageId);
                const firing = activeRuleIds.has(rule.id);
                const isSelected = selectedRuleId === rule.id;
                const status = resolveCardStatus(inScope, firing);

                return (
                    <li key={rule.id} className="m-0 shrink-0">
                        <article
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                                onSelectRule(rule.id);
                            }}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    onSelectRule(rule.id);
                                }
                            }}
                            className="relative flex cursor-pointer flex-col gap-dp8 rounded-[5px] border border-dhis2-grey-300 bg-white py-[11px] pe-[12px] ps-[14px] shadow-[0_1px_2px_rgb(0_0_0/4%)]"
                        >
                            <span
                                className={`absolute inset-y-0 start-0 w-[3px] rounded-s-[5px] ${resolveAccentClassName(inScope, firing, isSelected)}`}
                                aria-hidden="true"
                            />
                            <div className="flex items-start justify-between gap-dp8">
                                <h3
                                    className={`m-0 min-w-0 flex-1 text-sm font-semibold leading-[1.4] ${
                                        inScope ? 'text-dhis2-grey-900' : 'text-dhis2-grey-600'
                                    }`}
                                >
                                    {rule.name}
                                </h3>
                                <span className="flex shrink-0 items-center gap-[6px]">
                                    <span
                                        className={`text-[11px] font-semibold ${status.className}`}
                                    >
                                        {status.label}
                                    </span>
                                    <button
                                        type="button"
                                        title={translate('Program rule details')}
                                        aria-label={translate('Program rule details')}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onOpenDetails(rule.id);
                                        }}
                                        className="inline-flex size-[22px] shrink-0 cursor-pointer items-center justify-center rounded-[3px] border-0 bg-transparent text-dhis2-grey-600 hover:bg-dhis2-grey-200 hover:text-dhis2-blue-600"
                                    >
                                        <IconInfo16 />
                                    </button>
                                </span>
                            </div>

                            {rule.programRuleActions.length ? (
                                <div className="flex flex-wrap gap-[6px]">
                                    {rule.programRuleActions.map((action, index) => {
                                        const summary = formatRuleActionSummary(
                                            action,
                                            labelLookup
                                        );
                                        return (
                                            <EffectBadge
                                                key={`${rule.id}-action-${String(index)}`}
                                                type={summary.type}
                                            >
                                                {formatActionLabel(summary)}
                                            </EffectBadge>
                                        );
                                    })}
                                </div>
                            ) : null}

                            {showConditions && rule.condition ? (
                                <p
                                    className="m-0 break-words font-mono text-[11px] leading-[1.5] text-dhis2-grey-700"
                                    title={rule.condition}
                                >
                                    {rule.condition}
                                </p>
                            ) : null}

                            {!inScope && rule.programStageId ? (
                                <span className="text-[11px] text-dhis2-grey-600">
                                    {translate('Applies to {{stage}}', {
                                        stage: labelLookup.resolveStageName(rule.programStageId),
                                    })}
                                </span>
                            ) : null}
                        </article>
                    </li>
                );
            })}
        </ul>
    );
}
