/**
 * Serializes parsed (typed) form values into the string values DHIS2 expects in
 * `dataValues` / `attributes`. Empty values (`undefined` / `null`) are dropped.
 * Accepts `filterPayload` output directly; non-primitive values are a programming error.
 */
export function toPayloadValues(values: Record<string, unknown>): Record<string, string> {
    const payload: Record<string, string> = {};
    for (const [key, value] of Object.entries(values)) {
        if (value === undefined || value === null) continue;
        if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
            throw new TypeError(`Cannot serialize non-primitive value for "${key}"`);
        }
        payload[key] = String(value);
    }
    return payload;
}
