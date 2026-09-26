import { NoticeBox } from '@dhis2/ui';
import type { RuleTraceEntry } from '@nnkogift/dhis2-form-utils-hooks';
import { useEffect, useState } from 'react';
import type { DevtoolsLabelLookup } from '../../lib/createLabelLookup';
import { translate } from '../../i18n';
import { TraceEntryCard } from './TraceEntryCard';

type TraceTimelineProps = {
    entries: readonly RuleTraceEntry[];
    selectedEntryId: string | null;
    highlightRuleId: string | null;
    onSelectEntry: (entryId: string) => void;
    onHighlightRule: (ruleId: string | null) => void;
    labelLookup?: DevtoolsLabelLookup;
};

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
            {reversed.map((entry) => (
                <li key={entry.id} className="m-0">
                    <TraceEntryCard
                        entry={entry}
                        isExpanded={expandedIds.has(entry.id)}
                        isSelected={selectedEntryId === entry.id}
                        highlightRuleId={highlightRuleId}
                        labelLookup={labelLookup}
                        onToggleExpanded={toggleExpanded}
                        onSelectEntry={onSelectEntry}
                        onHighlightRule={onHighlightRule}
                    />
                </li>
            ))}
        </ul>
    );
}
