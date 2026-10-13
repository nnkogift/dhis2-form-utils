/** Matches `V{name}`, `A{uid}` and `#{uid}` placeholders in notification templates. */
const PLACEHOLDER_PATTERN = /[VA#]\{([^}]+)\}/g;

export type TemplateSegment =
    | { kind: 'text'; text: string }
    | { kind: 'placeholder'; token: string };

function resolveValue(key: string, values: Record<string, unknown>): string | null {
    const value = values[key];
    if (value === undefined || value === null || value === '') {
        return null;
    }
    if (typeof value === 'string') {
        return value;
    }
    return typeof value === 'number' || typeof value === 'boolean' ? String(value) : null;
}

function appendText(segments: TemplateSegment[], text: string): void {
    if (!text) {
        return;
    }
    const last = segments.length > 0 ? segments[segments.length - 1] : undefined;
    if (last?.kind === 'text') {
        last.text += text;
        return;
    }
    segments.push({ kind: 'text', text });
}

/**
 * Splits a notification template into text and placeholder segments. Placeholders whose key has
 * a usable value in `values` are substituted into the text; the rest are kept as `placeholder`
 * segments so the UI can show them as chips.
 */
export function renderTemplatePlaceholders(
    template: string,
    values: Record<string, unknown>
): TemplateSegment[] {
    const segments: TemplateSegment[] = [];
    let cursor = 0;

    for (const match of template.matchAll(PLACEHOLDER_PATTERN)) {
        appendText(segments, template.slice(cursor, match.index));
        const resolved = resolveValue(match[1], values);
        if (resolved === null) {
            segments.push({ kind: 'placeholder', token: match[0] });
        } else {
            appendText(segments, resolved);
        }
        cursor = match.index + match[0].length;
    }
    appendText(segments, template.slice(cursor));

    return segments;
}
