import type { OptionGroupCodeMap } from '@dhis2-form-utils/metadata';
import type { FieldState } from './types';

/**
 * Resolves a field's rule-driven option visibility state into a single set of hidden option
 * codes — the union of directly hidden options and the members of any hidden option groups.
 * A `hiddenOptionGroups` id with no matching entry in `optionGroups` contributes nothing, so
 * this degrades gracefully when group membership hasn't been fetched.
 */
export function resolveHiddenOptionCodes(
    state: Pick<FieldState, 'hiddenOptions' | 'hiddenOptionGroups'>,
    optionGroups?: OptionGroupCodeMap
): Set<string> {
    const hidden = new Set(state.hiddenOptions);

    for (const groupId of state.hiddenOptionGroups) {
        for (const code of optionGroups?.[groupId] ?? []) {
            hidden.add(code);
        }
    }

    return hidden;
}
