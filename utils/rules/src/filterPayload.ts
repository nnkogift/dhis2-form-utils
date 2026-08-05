import type { OptionGroupCodeMap } from '@nnkogift/dhis2-form-utils-metadata';
import { parseMultiTextValue } from '@nnkogift/dhis2-form-utils-metadata';
import { resolveHiddenOptionCodes } from './resolveHiddenOptionCodes';
import type { FieldStateMap } from './types';

const filterHiddenCodes = (value: string, hiddenCodes: Set<string>): string | null => {
    const codes = parseMultiTextValue(value);
    if (codes.length === 0) {
        return hiddenCodes.has(value) ? null : value;
    }

    if (codes.length === 1) {
        const [onlyCode] = codes;
        return hiddenCodes.has(onlyCode) ? null : onlyCode;
    }

    const remaining = codes.filter((code) => !hiddenCodes.has(code));
    if (remaining.length === 0) return null;
    return remaining.join(',');
};

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
        } else if (typeof value === 'string') {
            const hiddenCodes = resolveHiddenOptionCodes(state, optionGroups);
            if (hiddenCodes.size === 0) {
                result[key] = value;
            } else {
                result[key] = filterHiddenCodes(value, hiddenCodes);
            }
        } else {
            result[key] = value;
        }
    }

    return result;
}
