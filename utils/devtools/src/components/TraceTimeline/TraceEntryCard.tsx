import { Card, IconChevronDown16, IconChevronRight16, Tag } from '@dhis2/ui';
import type { RuleTraceEntry } from '@nnkogift/dhis2-form-utils-hooks';
import type { DevtoolsLabelLookup } from '../../lib/createLabelLookup';
import { formatAgo } from '../../utils/formatAgo';
import { translate } from '../../i18n/index';
import { RuleResultBlock } from './RuleResultBlock';
import { resolveLabel } from './shared';

// fallow-ignore-next-line complexity
export function TraceEntryCard({
    entry,
    isExpanded,
    isSelected,
    highlightRuleId,
    labelLookup,
    onToggleExpanded,
    onSelectEntry,
    onHighlightRule,
}: {
    entry: RuleTraceEntry;
    isExpanded: boolean;
    isSelected: boolean;
    highlightRuleId: string | null;
    labelLookup?: DevtoolsLabelLookup;
    onToggleExpanded: (entryId: string) => void;
    onSelectEntry: (entryId: string) => void;
    onHighlightRule: (ruleId: string | null) => void;
}) {
    const isInitial = entry.changedFields.length === 0;
    const ruleCount = entry.ruleResults.length;
    const effectCount = entry.ruleResults.reduce(
        (total, result) => total + result.effects.length,
        0
    );

    return (
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
                        onToggleExpanded(entry.id);
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
                                {translate('{{count}} effects', { count: effectCount })}
                            </span>
                        ) : null}
                    </span>
                    <Tag className={isInitial ? 'shrink-0' : undefined} neutral={!isInitial}>
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
                                ? translate('{{count}} effects on load', { count: effectCount })
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
                                            ? (id) => labelLookup.resolveFieldName(id)
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
                                {entry.ruleResults.map((result, index) => (
                                    <RuleResultBlock
                                        key={result.ruleId}
                                        result={result}
                                        index={index}
                                        highlightRuleId={highlightRuleId}
                                        onHighlightRule={onHighlightRule}
                                        labelLookup={labelLookup}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            ) : null}
        </Card>
    );
}
