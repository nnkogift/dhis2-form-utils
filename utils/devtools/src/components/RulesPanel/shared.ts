import type { RuleDevtoolsMetadata } from '../../lib/createLabelLookup';
import type { CatalogRule } from '../../lib/resolveProgramRulesList';

export type RuleScopeFilter = 'scoped' | 'all';

const WITHOUT_REGISTRATION = 'WITHOUT_REGISTRATION';

/**
 * Stage-based scope filtering applies to tracker programs and event programs that use
 * registration. Single-stage event programs (`WITHOUT_REGISTRATION`) do not scope rules to a
 * program stage in DHIS2, so devtools treats every rule as in scope and hides the scope filter.
 */
export function isProgramRuleScopeFilterEnabled(metadata: RuleDevtoolsMetadata): boolean {
    if (metadata.formKind !== 'event') {
        return true;
    }
    return metadata.metadata.programType !== WITHOUT_REGISTRATION;
}

/**
 * A rule with no `programStageId` belongs to the registration/enrollment form only — it is in
 * scope there and nowhere else. A rule with a `programStageId` is in scope only for that exact
 * stage. Scope is strictly tied to the form currently being viewed, not to where the underlying
 * DHIS2 rule engine happens to evaluate the rule.
 *
 * When `scopeFilterEnabled` is false (event `WITHOUT_REGISTRATION` programs), every rule is in
 * scope regardless of `programStageId`.
 */
export function isRuleInScope(
    rule: CatalogRule,
    scopeStageId: string | null,
    scopeFilterEnabled = true
): boolean {
    if (!scopeFilterEnabled) {
        return true;
    }
    return rule.programStageId === scopeStageId;
}
