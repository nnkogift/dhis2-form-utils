import { filterEventProgramRules } from '@dhis2-form-utils/metadata';
import type { RuleDevtoolsMetadata } from './createLabelLookup';
import type { RuleActionLike } from './formatRuleActionSummary';

export type CatalogRule = {
    id: string;
    name: string;
    condition?: string;
    priority?: number;
    programRuleActions: RuleActionLike[];
};

function sortByPriority(rules: CatalogRule[]): CatalogRule[] {
    return [...rules].sort((left, right) => (left.priority ?? 0) - (right.priority ?? 0));
}

export function resolveProgramRulesList(metadata: RuleDevtoolsMetadata): CatalogRule[] {
    if (metadata.formKind === 'event') {
        const rules = filterEventProgramRules(metadata.metadata, metadata.programStageId);
        return sortByPriority(
            rules
                .filter((rule): rule is typeof rule & { id: string } => Boolean(rule.id))
                .map((rule) => ({
                    id: rule.id,
                    name: rule.displayName ?? rule.id,
                    condition: rule.condition,
                    priority: rule.priority,
                    programRuleActions: rule.programRuleActions,
                }))
        );
    }

    return sortByPriority(
        metadata.metadata.programRules
            .filter((rule): rule is typeof rule & { id: string } => Boolean(rule.id))
            .map((rule) => ({
                id: rule.id,
                name: rule.name ?? rule.id,
                condition: rule.condition,
                priority: rule.priority,
                programRuleActions: rule.programRuleActions,
            }))
    );
}
