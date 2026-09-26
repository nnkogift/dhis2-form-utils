import type { CatalogRule } from '../../lib/resolveProgramRulesList';

export type RuleScopeFilter = 'scoped' | 'all';

/**
 * A rule with no `programStageId` belongs to the registration/enrollment form only — it is in
 * scope there and nowhere else. A rule with a `programStageId` is in scope only for that exact
 * stage. Scope is strictly tied to the form currently being viewed, not to where the underlying
 * DHIS2 rule engine happens to evaluate the rule.
 */
export function isRuleInScope(rule: CatalogRule, scopeStageId: string | null): boolean {
    return rule.programStageId === scopeStageId;
}
