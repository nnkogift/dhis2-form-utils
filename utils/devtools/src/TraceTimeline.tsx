import {
    Card,
    Chip,
    Divider,
    IconChevronDown16,
    IconChevronRight16,
    NoticeBox,
    Tag,
} from '@dhis2/ui';
import type { RuleTraceEntry } from '@dhis2-form-utils/hooks';
import { useEffect, useState } from 'react';
import { getEffectTagClassName } from './effectStyles';
import { formatAgo } from './formatAgo';
import { translate } from './i18n';

type TraceTimelineProps = {
    entries: readonly RuleTraceEntry[];
    selectedEntryId: string | null;
    highlightRuleId: string | null;
    onSelectEntry: (entryId: string) => void;
    onHighlightRule: (ruleId: string | null) => void;
    resolveRuleName?: (ruleId: string) => string | undefined;
};

export function TraceTimeline({
    entries,
    selectedEntryId,
    highlightRuleId,
    onSelectEntry,
    onHighlightRule,
    resolveRuleName,
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
            <div className="rule-devtools-notice">
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
        <ul className="rule-devtools-trace-list">
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
                    <li key={entry.id} className="rule-devtools-trace-item">
                        <Card
                            className={`rule-devtools-trace-card ${
                                isSelected ? 'rule-devtools-trace-card--selected' : ''
                            }`}
                        >
                            <div className="rule-devtools-trace-card-header">
                                <button
                                    type="button"
                                    className="rule-devtools-trace-expand"
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
                                    className="rule-devtools-trace-summary"
                                    aria-pressed={isSelected}
                                    onClick={() => {
                                        onSelectEntry(entry.id);
                                    }}
                                >
                                    <span className="rule-devtools-trace-summary-main">
                                        <span className="rule-devtools-trace-time">
                                            {formatAgo(entry.timestamp)}
                                        </span>
                                        {!isExpanded && effectCount > 0 ? (
                                            <span className="rule-devtools-trace-preview">
                                                {translate('{{count}} effects', {
                                                    count: effectCount,
                                                })}
                                            </span>
                                        ) : null}
                                    </span>
                                    <Tag
                                        className={
                                            isInitial ? 'rule-devtools-trace-status-tag' : undefined
                                        }
                                        neutral={!isInitial}
                                    >
                                        {isInitial
                                            ? translate('Initial')
                                            : translate('{{count}} rules', { count: ruleCount })}
                                    </Tag>
                                </button>
                            </div>

                            {isExpanded ? (
                                <div className="rule-devtools-trace-card-body">
                                    {isInitial ? (
                                        <p className="rule-devtools-trace-empty">
                                            {ruleCount
                                                ? translate('{{count}} effects on load', {
                                                      count: effectCount,
                                                  })
                                                : translate('No rules fired')}
                                        </p>
                                    ) : (
                                        <section className="rule-devtools-trace-section">
                                            <h3 className="rule-devtools-trace-section-label">
                                                {translate('Changed fields')}
                                            </h3>
                                            <div className="rule-devtools-trace-fields">
                                                {entry.changedFields.map((fieldId) => (
                                                    <Tag
                                                        key={fieldId}
                                                        neutral
                                                        className="rule-devtools-field-tag"
                                                    >
                                                        {fieldId}
                                                    </Tag>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {entry.ruleResults.length === 0 ? (
                                        !isInitial ? (
                                            <p className="rule-devtools-trace-empty">
                                                {translate('No rules fired')}
                                            </p>
                                        ) : null
                                    ) : (
                                        <section className="rule-devtools-trace-section">
                                            {!isInitial ? (
                                                <h3 className="rule-devtools-trace-section-label">
                                                    {translate('Rules fired')}
                                                </h3>
                                            ) : null}
                                            <div className="rule-devtools-rule-list">
                                                {entry.ruleResults.map((result, index) => {
                                                    const displayName =
                                                        resolveRuleName?.(result.ruleId) ??
                                                        result.ruleId;
                                                    const showRuleId =
                                                        displayName !== result.ruleId;

                                                    return (
                                                        <div
                                                            key={result.ruleId}
                                                            className="rule-devtools-rule-panel"
                                                        >
                                                            {index > 0 ? (
                                                                <Divider margin="12px 0" />
                                                            ) : null}
                                                            <div className="rule-devtools-rule-header">
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
                                                                {showRuleId ? (
                                                                    <span className="rule-devtools-rule-id">
                                                                        {result.ruleId}
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                            <ul className="rule-devtools-effect-list">
                                                                {result.effects.map((effect) => (
                                                                    <li
                                                                        key={`${effect.type}-${effect.targetId}-${effect.data ?? ''}`}
                                                                        className="rule-devtools-effect-row"
                                                                    >
                                                                        <div className="rule-devtools-effect-main">
                                                                            <Tag
                                                                                className={getEffectTagClassName(
                                                                                    effect.type
                                                                                )}
                                                                            >
                                                                                {effect.type}
                                                                            </Tag>
                                                                            <span className="rule-devtools-effect-target">
                                                                                {effect.targetId}
                                                                            </span>
                                                                        </div>
                                                                        {effect.data ? (
                                                                            <p className="rule-devtools-effect-data">
                                                                                {effect.data}
                                                                            </p>
                                                                        ) : null}
                                                                    </li>
                                                                ))}
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
