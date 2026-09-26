import type { RuleDevtoolsMetadata } from './createLabelLookup';
import type { RuleActionLike } from './formatRuleActionSummary';

export type CatalogRule = {
    id: string;
    name: string;
    condition?: string;
    priority?: number;
    programRuleActions: RuleActionLike[];
    /** Stage the rule applies to, or `null` for attribute-only/global rules. */
    programStageId: string | null;
};

function sortByPriority(rules: CatalogRule[]): CatalogRule[] {
    return [...rules].sort((left, right) => (left.priority ?? 0) - (right.priority ?? 0));
}

function toCatalogRule(rule: {
    id: string;
    name: string;
    condition?: string;
    priority?: number;
    programRuleActions?: readonly RuleActionLike[] | null;
    programStageId: string | null;
}): CatalogRule {
    return {
        id: rule.id,
        name: rule.name,
        condition: rule.condition,
        priority: rule.priority,
        programRuleActions: [...(rule.programRuleActions ?? [])],
        programStageId: rule.programStageId,
    };
}

/**
 * The full program rule catalog — every rule regardless of which slot is currently
 * being viewed. `RulesPanel` derives in-scope/out-of-scope status from `programStageId`
 * against the slot it renders, so this must not pre-filter by stage.
 */
export function resolveProgramRulesList(metadata: RuleDevtoolsMetadata): CatalogRule[] {
    if (metadata.formKind === 'event') {
        return sortByPriority(
            metadata.metadata.programRules
                .filter((rule): rule is typeof rule & { id: string } => Boolean(rule.id))
                .map((rule) =>
                    toCatalogRule({
                        id: rule.id,
                        name: rule.displayName ?? rule.id,
                        condition: rule.condition,
                        priority: rule.priority,
                        programRuleActions: rule.programRuleActions,
                        programStageId: rule.programStage?.id ?? null,
                    })
                )
        );
    }

    return sortByPriority(
        metadata.metadata.programRules
            .filter((rule): rule is typeof rule & { id: string } => Boolean(rule.id))
            .map((rule) =>
                toCatalogRule({
                    id: rule.id,
                    name: rule.name ?? rule.id,
                    condition: rule.condition,
                    priority: rule.priority,
                    programRuleActions: rule.programRuleActions,
                    programStageId: rule.programStage?.id ?? null,
                })
            )
    );
}
