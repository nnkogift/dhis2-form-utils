import type { FieldStateMap } from './types';

export function filterPayload(
    values: Record<string, unknown>,
    fieldState: FieldStateMap
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
        } else {
            result[key] = value;
        }
    }

    return result;
}
