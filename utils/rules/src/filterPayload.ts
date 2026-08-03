import type { OptionGroupCodeMap } from '@dhis2-form-utils/metadata';
import { resolveHiddenOptionCodes } from './resolveHiddenOptionCodes';
import type { FieldStateMap } from './types';

export function filterPayload(
    values: Record<string, unknown>,
    fieldState: FieldStateMap,
    optionGroups?: OptionGroupCodeMap
): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(values)) {
        if (!(key in fieldState)) {
            result[key] = value;
            continue;
        }

        const state = fieldState[key];
        if (state.hidden) continue;

        if (state.assignedValue !== null && state.assignedValue !== undefined) {
            result[key] = state.assignedValue;
        } else if (
            typeof value === 'string' &&
            resolveHiddenOptionCodes(state, optionGroups).has(value)
        ) {
            result[key] = null;
        } else {
            result[key] = value;
        }
    }

    return result;
}
