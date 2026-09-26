import { Chip, Divider } from '@dhis2/ui';
import type { RuleTraceEntry } from '@nnkogift/dhis2-form-utils-hooks';
import type { DevtoolsLabelLookup } from '../createLabelLookup';
import { EffectBadge } from '../EffectBadge';
import { resolveEffectTargetLabel, resolveLabel } from './shared';

export function RuleResultBlock({
    result,
    index,
    highlightRuleId,
    onHighlightRule,
    labelLookup,
}: {
    result: RuleTraceEntry['ruleResults'][number];
    index: number;
    highlightRuleId: string | null;
    onHighlightRule: (ruleId: string | null) => void;
    labelLookup?: DevtoolsLabelLookup;
}) {
    const { label: displayName } = resolveLabel(
        result.ruleId,
        labelLookup ? (id) => labelLookup.resolveRuleName(id) : undefined
    );

    return (
        <div className="rounded border border-dhis2-grey-200 bg-dhis2-grey-050 p-dp12">
            {index > 0 ? <Divider margin="12px 0" /> : null}
            <div className="mb-dp12 flex flex-col items-start gap-dp4">
                <Chip
                    selected={highlightRuleId === result.ruleId}
                    onClick={(_, event) => {
                        event.stopPropagation();
                        onHighlightRule(highlightRuleId === result.ruleId ? null : result.ruleId);
                    }}
                >
                    {displayName}
                </Chip>
            </div>
            <ul className="m-0 flex list-none flex-col gap-dp12 p-0">
                {result.effects.map((effect) => {
                    const { label: targetLabel, showId: showTargetId } = resolveEffectTargetLabel(
                        effect,
                        labelLookup
                    );

                    return (
                        <li
                            key={`${effect.type}-${effect.targetId}-${effect.data ?? ''}`}
                            className="flex flex-col gap-dp4"
                        >
                            <div className="flex flex-wrap items-baseline gap-dp8">
                                <EffectBadge type={effect.type} />
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
}
