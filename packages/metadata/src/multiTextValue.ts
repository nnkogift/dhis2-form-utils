/** Split a DHIS2 MULTI_TEXT form value into option codes. */
export function parseMultiTextValue(value: string | undefined | null): string[] {
    if (!value) return [];
    return value
        .split(',')
        .map((code) => code.trim())
        .filter((code) => code.length > 0);
}

/** Join option codes into a DHIS2 MULTI_TEXT form value. */
export function joinMultiTextValue(codes: readonly string[]): string {
    return codes.filter((code) => code.length > 0).join(',');
}
