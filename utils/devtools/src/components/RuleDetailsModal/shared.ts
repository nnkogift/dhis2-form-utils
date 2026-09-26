import type { ProgramRuleDetail } from '../../api/programRuleDetailQuery';

export const EM_DASH = '—';

export const SECTION_HEADING_CLASS =
    'm-0 mb-dp8 text-[13px] font-bold uppercase tracking-wide text-dhis2-grey-700';

export function orDash(value: string | undefined): string {
    return value ?? EM_DASH;
}

export function formatTimestamp(value: string | undefined): string | null {
    if (!value) {
        return null;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    const day = String(date.getDate());
    const month = date.toLocaleString('en-GB', { month: 'short' });
    const year = String(date.getFullYear());
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} ${hours}:${minutes}`;
}

function resolveDetailDisplayName(rule: ProgramRuleDetail | undefined): string | undefined {
    return rule?.displayName;
}

function resolveDetailName(rule: ProgramRuleDetail | undefined): string | undefined {
    return rule?.name;
}

/** Shared by the modal title and the "Name" basic-detail cell — both fall back the same way. */
export function resolveRuleDisplayName(
    rule: ProgramRuleDetail | undefined,
    fallback: string
): string {
    const displayName = resolveDetailDisplayName(rule) ?? resolveDetailName(rule);
    return displayName ?? fallback;
}
