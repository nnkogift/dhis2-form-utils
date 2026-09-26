import type { RuleTraceEntry } from '@nnkogift/dhis2-form-utils-hooks';

/**
 * Resolves which trace entry the dependency graph should render.
 * Defaults to the latest evaluation (active rules); uses the selected
 * trace entry when the user is inspecting a past evaluation.
 */
export function resolveGraphTraceEntry(
    entries: readonly RuleTraceEntry[],
    selectedEntryId?: string | null
): RuleTraceEntry | null {
    if (!entries.length) {
        return null;
    }
    if (selectedEntryId) {
        return entries.find((entry) => entry.id === selectedEntryId) ?? entries[entries.length - 1];
    }
    return entries[entries.length - 1];
}

/** Rule IDs that fired in the latest evaluation cycle. */
export function getActiveRuleIds(entries: readonly RuleTraceEntry[]): ReadonlySet<string> {
    const latest = resolveGraphTraceEntry(entries);
    if (!latest) {
        return new Set<string>();
    }
    return new Set(latest.ruleResults.map((result) => result.ruleId));
}
