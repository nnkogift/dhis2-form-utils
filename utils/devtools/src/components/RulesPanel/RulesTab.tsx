import { useMemo, useRef } from 'react';
import type { createLabelLookup } from '../../lib/createLabelLookup';
import { translate } from '../../i18n/index';
import type { CatalogRule } from '../../lib/resolveProgramRulesList';
import { useFlipReorder } from '../../hooks/useFlipReorder';
import { RuleCatalogCard } from './RuleCatalogCard';
import { isRuleInScope, type RuleScopeFilter } from './shared';

function sortRulesFiringFirst(
    visibleRules: CatalogRule[],
    activeRuleIds: ReadonlySet<string>
): CatalogRule[] {
    const firing: CatalogRule[] = [];
    const idle: CatalogRule[] = [];
    for (const rule of visibleRules) {
        (activeRuleIds.has(rule.id) ? firing : idle).push(rule);
    }
    return [...firing, ...idle];
}

type RulesTabProps = {
    catalog: CatalogRule[];
    scopeStageId: string | null;
    scopeFilter: RuleScopeFilter;
    scopeFilterEnabled: boolean;
    activeRuleIds: ReadonlySet<string>;
    selectedRuleId: string | null;
    showConditions: boolean;
    labelLookup: ReturnType<typeof createLabelLookup>;
    onSelectRule: (ruleId: string) => void;
    onOpenDetails: (ruleId: string) => void;
};

export function RulesTab({
    catalog,
    scopeStageId,
    scopeFilter,
    scopeFilterEnabled,
    activeRuleIds,
    selectedRuleId,
    showConditions,
    labelLookup,
    onSelectRule,
    onOpenDetails,
}: RulesTabProps) {
    const listRef = useRef<HTMLUListElement>(null);
    const visibleRules = useMemo(
        () =>
            catalog.filter(
                (rule) =>
                    !scopeFilterEnabled ||
                    scopeFilter === 'all' ||
                    isRuleInScope(rule, scopeStageId, scopeFilterEnabled)
            ),
        [catalog, scopeFilter, scopeFilterEnabled, scopeStageId]
    );
    const sortedRules = useMemo(
        () => sortRulesFiringFirst(visibleRules, activeRuleIds),
        [activeRuleIds, visibleRules]
    );

    useFlipReorder(
        sortedRules.map((rule) => rule.id),
        listRef
    );

    if (!sortedRules.length) {
        return (
            <p className="m-0 text-sm text-dhis2-grey-600">
                {translate('No program rules match this view.')}
            </p>
        );
    }

    return (
        <ul ref={listRef} className="m-0 flex list-none flex-col gap-[10px] p-0">
            {sortedRules.map((rule) => (
                <RuleCatalogCard
                    key={rule.id}
                    rule={rule}
                    scopeStageId={scopeStageId}
                    scopeFilterEnabled={scopeFilterEnabled}
                    firing={activeRuleIds.has(rule.id)}
                    isSelected={selectedRuleId === rule.id}
                    showConditions={showConditions}
                    labelLookup={labelLookup}
                    onSelectRule={onSelectRule}
                    onOpenDetails={onOpenDetails}
                />
            ))}
        </ul>
    );
}
