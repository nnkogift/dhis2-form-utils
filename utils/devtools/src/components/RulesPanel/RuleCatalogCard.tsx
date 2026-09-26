import { IconInfo16 } from '@dhis2/ui';
import type { DevtoolsLabelLookup, createLabelLookup } from '../../lib/createLabelLookup';
import { EffectBadge } from '../EffectBadge';
import { formatRuleActionSummary } from '../../lib/formatRuleActionSummary';
import { translate } from '../../i18n';
import type { CatalogRule } from '../../lib/resolveProgramRulesList';
import { isRuleInScope } from './shared';

type RuleCardStatus = {
    label: string;
    className: string;
};

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

function resolveAppliesToCaption(rule: CatalogRule, labelLookup: DevtoolsLabelLookup): string {
    return rule.programStageId === null
        ? translate('Applies to registration')
        : translate('Applies to {{stage}}', {
              stage: labelLookup.resolveStageName(rule.programStageId),
          });
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

// fallow-ignore-next-line complexity
export function RuleCatalogCard({
    rule,
    scopeStageId,
    firing,
    isSelected,
    showConditions,
    labelLookup,
    onSelectRule,
    onOpenDetails,
}: {
    rule: CatalogRule;
    scopeStageId: string | null;
    firing: boolean;
    isSelected: boolean;
    showConditions: boolean;
    labelLookup: ReturnType<typeof createLabelLookup>;
    onSelectRule: (ruleId: string) => void;
    onOpenDetails: (ruleId: string) => void;
}) {
    const inScope = isRuleInScope(rule, scopeStageId);
    const status = resolveCardStatus(inScope, firing);

    return (
        <li data-rule-id={rule.id} className="m-0 shrink-0">
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
                        <span className={`text-[11px] font-semibold ${status.className}`}>
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
                            const summary = formatRuleActionSummary(action, labelLookup);
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

                {!inScope ? (
                    <span className="text-[11px] text-dhis2-grey-600">
                        {resolveAppliesToCaption(rule, labelLookup)}
                    </span>
                ) : null}
            </article>
        </li>
    );
}
