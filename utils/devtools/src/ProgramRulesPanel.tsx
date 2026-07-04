import { IconCheckmarkCircle16, NoticeBox } from '@dhis2/ui';
import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { EffectBadge } from './EffectBadge';
import { createLabelLookup, type RuleDevtoolsMetadata } from './createLabelLookup';
import { formatRuleActionSummary } from './formatRuleActionSummary';
import { translate } from './i18n';
import { resolveProgramRulesList } from './resolveProgramRulesList';
import { useRuleTraceStore } from './RuleDevtoolsScope';

export type ProgramRulesPanelProps = {
    metadata: RuleDevtoolsMetadata;
};

function useActiveRuleIds(): ReadonlySet<string> {
    const traceStore = useRuleTraceStore();
    const entries = useSyncExternalStore(
        useCallback((listener) => traceStore.subscribe(listener), [traceStore]),
        useCallback(() => traceStore.getSnapshot(), [traceStore]),
        useCallback(() => traceStore.getSnapshot(), [traceStore])
    );

    return useMemo(() => {
        if (!entries.length) {
            return new Set<string>();
        }
        const latest = entries[entries.length - 1];
        return new Set(latest.ruleResults.map((result) => result.ruleId));
    }, [entries]);
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

export function ProgramRulesPanel({ metadata }: ProgramRulesPanelProps) {
    const labelLookup = useMemo(() => createLabelLookup(metadata), [metadata]);
    const rules = useMemo(() => resolveProgramRulesList(metadata), [metadata]);
    const activeRuleIds = useActiveRuleIds();
    const activeCount = rules.filter((rule) => activeRuleIds.has(rule.id)).length;

    return (
        <aside
            className="flex h-full w-[360px] min-w-[280px] max-w-[min(92vw,420px)] flex-col border-e border-dhis2-grey-300 bg-dhis2-grey-100"
            aria-label={translate('Program rules')}
        >
            <header className="shrink-0 border-b border-dhis2-grey-200 bg-white px-dp16 pt-dp16 pb-dp12">
                <h2 className="m-0 text-base font-bold leading-[1.35] text-dhis2-grey-900">
                    {translate('Program rules')}
                </h2>
                <p className="m-0 mt-dp4 text-[0.8125rem] leading-normal text-dhis2-grey-700">
                    {rules.length
                        ? translate('{{total}} rules · {{active}} active', {
                              total: rules.length,
                              active: activeCount,
                          })
                        : translate('No program rules configured for this form')}
                </p>
            </header>

            <div className="min-h-0 flex-1 overflow-auto p-dp16">
                {!rules.length ? (
                    <NoticeBox title={translate('No rules')}>
                        {translate('This program has no rules for the current form context.')}
                    </NoticeBox>
                ) : (
                    <ul className="m-0 flex list-none flex-col gap-dp12 p-0">
                        {rules.map((rule) => {
                            const isActive = activeRuleIds.has(rule.id);

                            return (
                                <li key={rule.id} className="m-0">
                                    <article
                                        className={`rounded-md border border-dhis2-grey-300 bg-white p-dp12 shadow-[0_1px_2px_rgb(0_0_0/4%)] ${
                                            isActive
                                                ? 'border-s-[3px] border-s-dhis2-teal-600 bg-dhis2-teal-050'
                                                : ''
                                        }`}
                                        aria-current={isActive ? 'true' : undefined}
                                    >
                                        <div className="flex items-start justify-between gap-dp8">
                                            <h3 className="m-0 min-w-0 flex-1 text-sm font-semibold leading-[1.35] text-dhis2-grey-900">
                                                {rule.name}
                                            </h3>
                                            {isActive ? (
                                                <span
                                                    className="inline-flex size-6 shrink-0 items-center justify-center text-dhis2-teal-700"
                                                    title={translate('Active')}
                                                >
                                                    <IconCheckmarkCircle16 />
                                                    <span className="sr-only">
                                                        {translate('Active')}
                                                    </span>
                                                </span>
                                            ) : null}
                                        </div>

                                        {rule.programRuleActions.length ? (
                                            <div className="mt-dp8 flex flex-wrap gap-dp8">
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
                                        ) : (
                                            <p className="m-0 mt-dp8 text-xs leading-normal text-dhis2-grey-600">
                                                {translate('No actions configured')}
                                            </p>
                                        )}

                                        {rule.condition ? (
                                            <p
                                                className="m-0 mt-dp8 font-mono text-xs leading-[1.45] text-dhis2-grey-700 break-words"
                                                title={rule.condition}
                                            >
                                                {rule.condition}
                                            </p>
                                        ) : null}
                                    </article>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </aside>
    );
}
