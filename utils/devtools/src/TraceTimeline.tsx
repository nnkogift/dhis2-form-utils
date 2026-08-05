import {
    Card,
    Chip,
    Divider,
    IconChevronDown16,
    IconChevronRight16,
    NoticeBox,
    Tag,
} from '@dhis2/ui';
import type { RuleTraceEntry, TraceEffect } from '@nnkogift/dhis2-form-utils-hooks';
import { useEffect, useState } from 'react';
import type { DevtoolsLabelLookup } from './createLabelLookup';
import { EffectBadge } from './EffectBadge';
import { formatAgo } from './formatAgo';
import { translate } from './i18n';

type TraceTimelineProps = {
    entries: readonly RuleTraceEntry[];
    selectedEntryId: string | null;
    highlightRuleId: string | null;
    onSelectEntry: (entryId: string) => void;
    onHighlightRule: (ruleId: string | null) => void;
    labelLookup?: DevtoolsLabelLookup;
};

function resolveLabel(
    id: string,
    resolver?: (value: string) => string
): { label: string; showId: boolean } {
    const label = resolver?.(id) ?? id;
    return { label, showId: label !== id };
}

function resolveEffectTargetLabel(
    effect: TraceEffect,
    labelLookup?: DevtoolsLabelLookup
): { label: string; showId: boolean } {
    if (effect.type === 'HIDESECTION') {
        return resolveLabel(
            effect.targetId,
            labelLookup ? (id) => labelLookup.resolveSectionName(id) : undefined
        );
    }

    if (effect.type === 'DISPLAYTEXT' || effect.type === 'DISPLAYKEYVALUEPAIR') {
        return { label: effect.targetId, showId: false };
    }

    return resolveLabel(
        effect.targetId,
        labelLookup ? (id) => labelLookup.resolveFieldName(id) : undefined
    );
}

export function TraceTimeline({
    entries,
    selectedEntryId,
    highlightRuleId,
    onSelectEntry,
    onHighlightRule,
    labelLookup,
}: TraceTimelineProps) {
    const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(() => new Set());

    useEffect(() => {
        if (!entries.length) {
            setExpandedIds(new Set());
            return;
        }

        const newestId = entries[entries.length - 1]?.id;
        if (!newestId) {
            return;
        }

        setExpandedIds((current) => {
            if (current.size > 0) {
                return current;
            }
            return new Set([newestId]);
        });
    }, [entries]);

    if (!entries.length) {
        return (
            <div className="p-dp8">
                <NoticeBox title={translate('No rules observed yet')}>
                    {translate(
                        'Interact with the form to record rule evaluations. Only rules that have fired at least once appear here.'
                    )}
                </NoticeBox>
            </div>
        );
    }

    const reversed = [...entries].reverse();

    const toggleExpanded = (entryId: string) => {
        setExpandedIds((current) => {
            const next = new Set(current);
            if (next.has(entryId)) {
                next.delete(entryId);
            } else {
                next.add(entryId);
            }
            return next;
        });
    };

    return (
        <ul className="m-0 flex list-none flex-col gap-dp12 p-0">
            {reversed.map((entry) => {
                const isInitial = entry.changedFields.length === 0;
                const ruleCount = entry.ruleResults.length;
                const effectCount = entry.ruleResults.reduce(
                    (total, result) => total + result.effects.length,
                    0
                );
                const isExpanded = expandedIds.has(entry.id);
                const isSelected = selectedEntryId === entry.id;

                return (
                    <li key={entry.id} className="m-0">
                        <Card
                            className={`overflow-hidden rounded-md border border-dhis2-grey-300 bg-white shadow-[0_1px_2px_rgb(0_0_0/4%)] transition-[border-color,box-shadow] duration-150 ease-out ${
                                isSelected
                                    ? 'border-dhis2-teal-600 shadow-[0_0_0_1px_var(--color-dhis2-teal-600),0_2px_8px_rgb(0_137_123/12%)]'
                                    : ''
                            }`}
                        >
                            <div className="flex items-stretch gap-dp4 bg-dhis2-grey-050 py-dp4 pe-dp8 ps-dp4">
                                <button
                                    type="button"
                                    className="inline-flex size-10 min-h-10 min-w-10 shrink-0 cursor-pointer items-center justify-center self-center rounded border-none bg-transparent text-dhis2-grey-700 hover:bg-dhis2-grey-200 focus-visible:outline-2 focus-visible:outline-dhis2-teal-600 focus-visible:outline-offset-1"
                                    aria-expanded={isExpanded}
                                    aria-label={
                                        isExpanded
                                            ? translate('Collapse evaluation details')
                                            : translate('Expand evaluation details')
                                    }
                                    onClick={() => {
                                        toggleExpanded(entry.id);
                                    }}
                                >
                                    {isExpanded ? <IconChevronDown16 /> : <IconChevronRight16 />}
                                </button>

                                <button
                                    type="button"
                                    className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center justify-between gap-dp12 rounded border-none bg-transparent py-dp8 pe-dp8 ps-dp4 text-start font-[inherit] text-inherit hover:bg-white/80 focus-visible:outline-2 focus-visible:outline-dhis2-teal-600 focus-visible:outline-offset-1"
                                    aria-pressed={isSelected}
                                    onClick={() => {
                                        onSelectEntry(entry.id);
                                    }}
                                >
                                    <span className="flex min-w-0 flex-col items-start gap-0.5">
                                        <span className="text-sm font-semibold leading-[1.3] text-dhis2-grey-900 tabular-nums">
                                            {formatAgo(entry.timestamp)}
                                        </span>
                                        {!isExpanded && effectCount > 0 ? (
                                            <span className="text-xs leading-[1.3] text-dhis2-grey-600">
                                                {translate('{{count}} effects', {
                                                    count: effectCount,
                                                })}
                                            </span>
                                        ) : null}
                                    </span>
                                    <Tag
                                        className={isInitial ? 'shrink-0' : undefined}
                                        neutral={!isInitial}
                                    >
                                        {isInitial
                                            ? translate('Initial')
                                            : translate('{{count}} rules', { count: ruleCount })}
                                    </Tag>
                                </button>
                            </div>

                            {isExpanded ? (
                                <div className="flex flex-col gap-dp16 border-t border-dhis2-grey-200 p-dp16">
                                    {isInitial ? (
                                        <p className="m-0 text-sm leading-normal text-dhis2-grey-600">
                                            {ruleCount
                                                ? translate('{{count}} effects on load', {
                                                      count: effectCount,
                                                  })
                                                : translate('No rules fired')}
                                        </p>
                                    ) : (
                                        <section className="flex flex-col gap-dp8">
                                            <h3 className="m-0 text-[0.6875rem] font-bold uppercase leading-[1.3] tracking-wider text-dhis2-grey-600">
                                                {translate('Changed fields')}
                                            </h3>
                                            <div className="flex flex-wrap gap-dp8">
                                                {entry.changedFields.map((fieldId) => {
                                                    const { label, showId } = resolveLabel(
                                                        fieldId,
                                                        labelLookup
                                                            ? (id) =>
                                                                  labelLookup.resolveFieldName(id)
                                                            : undefined
                                                    );

                                                    return (
                                                        <div
                                                            key={fieldId}
                                                            className="flex max-w-full flex-col gap-0.5"
                                                        >
                                                            <Tag
                                                                neutral
                                                                className={`max-w-full break-words text-xs ${showId ? '' : 'font-mono break-all'}`}
                                                            >
                                                                {label}
                                                            </Tag>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </section>
                                    )}

                                    {entry.ruleResults.length === 0 ? (
                                        !isInitial ? (
                                            <p className="m-0 text-sm leading-normal text-dhis2-grey-600">
                                                {translate('No rules fired')}
                                            </p>
                                        ) : null
                                    ) : (
                                        <section className="flex flex-col gap-dp8">
                                            {!isInitial ? (
                                                <h3 className="m-0 text-[0.6875rem] font-bold uppercase leading-[1.3] tracking-wider text-dhis2-grey-600">
                                                    {translate('Rules fired')}
                                                </h3>
                                            ) : null}
                                            <div className="flex flex-col gap-dp12">
                                                {entry.ruleResults.map((result, index) => {
                                                    const { label: displayName } = resolveLabel(
                                                        result.ruleId,
                                                        labelLookup
                                                            ? (id) =>
                                                                  labelLookup.resolveRuleName(id)
                                                            : undefined
                                                    );

                                                    return (
                                                        <div
                                                            key={result.ruleId}
                                                            className="rounded border border-dhis2-grey-200 bg-dhis2-grey-050 p-dp12"
                                                        >
                                                            {index > 0 ? (
                                                                <Divider margin="12px 0" />
                                                            ) : null}
                                                            <div className="mb-dp12 flex flex-col items-start gap-dp4">
                                                                <Chip
                                                                    selected={
                                                                        highlightRuleId ===
                                                                        result.ruleId
                                                                    }
                                                                    onClick={(_, event) => {
                                                                        event.stopPropagation();
                                                                        onHighlightRule(
                                                                            highlightRuleId ===
                                                                                result.ruleId
                                                                                ? null
                                                                                : result.ruleId
                                                                        );
                                                                    }}
                                                                >
                                                                    {displayName}
                                                                </Chip>
                                                            </div>
                                                            <ul className="m-0 flex list-none flex-col gap-dp12 p-0">
                                                                {result.effects.map((effect) => {
                                                                    const {
                                                                        label: targetLabel,
                                                                        showId: showTargetId,
                                                                    } = resolveEffectTargetLabel(
                                                                        effect,
                                                                        labelLookup
                                                                    );

                                                                    return (
                                                                        <li
                                                                            key={`${effect.type}-${effect.targetId}-${effect.data ?? ''}`}
                                                                            className="flex flex-col gap-dp4"
                                                                        >
                                                                            <div className="flex flex-wrap items-baseline gap-dp8">
                                                                                <EffectBadge
                                                                                    type={
                                                                                        effect.type
                                                                                    }
                                                                                />
                                                                                <span
                                                                                    className={`break-words text-[0.8125rem] leading-[1.45] text-dhis2-grey-800 ${showTargetId ? '' : 'break-all font-mono'}`}
                                                                                >
                                                                                    {targetLabel}
                                                                                </span>
                                                                            </div>
                                                                            {effect.data ? (
                                                                                <p className="m-0 ps-dp4 text-[0.8125rem] leading-[1.45] break-words text-dhis2-grey-600">
                                                                                    {effect.data}
                                                                                </p>
                                                                            ) : null}
                                                                        </li>
                                                                    );
                                                                })}
                                                            </ul>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </section>
                                    )}
                                </div>
                            ) : null}
                        </Card>
                    </li>
                );
            })}
        </ul>
    );
}
