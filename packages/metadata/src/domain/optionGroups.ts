import { ProgramRuleActionType } from './enums';
import type { ProgramRule } from './types';

/** Option-group id -> member option codes. */
export type OptionGroupCodeMap = Record<string, string[]>;

type RawOptionGroup = {
    id?: string;
    options?: Array<{ code?: string }>;
};

export type RawOptionGroupsResult = {
    optionGroups?: { optionGroups?: RawOptionGroup[] };
};

/**
 * Scans a program's rules for `HIDEOPTIONGROUP`/`SHOWOPTIONGROUP` action targets and
 * returns the distinct optionGroup ids referenced — the only ids worth querying for
 * group membership.
 */
export function extractReferencedOptionGroupIds(programRules: ProgramRule[]): string[] {
    const ids = new Set<string>();

    for (const rule of programRules) {
        for (const action of rule.programRuleActions ?? []) {
            const isOptionGroupAction =
                action.programRuleActionType === ProgramRuleActionType.HIDEOPTIONGROUP ||
                action.programRuleActionType === ProgramRuleActionType.SHOWOPTIONGROUP;

            if (isOptionGroupAction && action.optionGroup?.id) {
                ids.add(action.optionGroup.id);
            }
        }
    }

    return [...ids];
}

/**
 * Resolves the raw `optionGroupsQuery` result into an `OptionGroupCodeMap`.
 * Pure and non-throwing — an empty map is a valid output, not an error state.
 */
export function resolveOptionGroups(raw: RawOptionGroupsResult): OptionGroupCodeMap {
    const map: OptionGroupCodeMap = {};

    for (const group of raw.optionGroups?.optionGroups ?? []) {
        if (!group.id) continue;
        map[group.id] = (group.options ?? []).flatMap((option) =>
            option.code ? [option.code] : []
        );
    }

    return map;
}
