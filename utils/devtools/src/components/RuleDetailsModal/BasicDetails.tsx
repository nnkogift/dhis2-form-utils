import type { ProgramRuleDetail } from '../../api/programRuleDetailQuery';
import { translate } from '../../i18n/index';
import { BasicDetailCell } from './BasicDetailCell';
import { EM_DASH, formatTimestamp, orDash, resolveRuleDisplayName } from './shared';

function resolveRuleStageName(rule: ProgramRuleDetail | undefined): string | undefined {
    return rule?.programStage?.displayName;
}

function resolveStageName(
    rule: ProgramRuleDetail | undefined,
    programStageName: string | null | undefined
): string {
    if (programStageName === null) {
        return translate('All stages (registration)');
    }
    return orDash(resolveRuleStageName(rule) ?? programStageName);
}

function resolveLastUpdatedByName(rule: ProgramRuleDetail | undefined): string | undefined {
    return rule?.lastUpdatedBy?.displayName;
}

function resolveLastUpdatedValue(rule: ProgramRuleDetail | undefined): string {
    const label = formatTimestamp(rule?.lastUpdated);
    if (!label) {
        return EM_DASH;
    }
    const by = resolveLastUpdatedByName(rule);
    return by ? `${label} · ${by}` : label;
}

function resolvePriorityCellValue(rule: ProgramRuleDetail | undefined): string {
    return rule?.priority != null ? String(rule.priority) : EM_DASH;
}

function resolveActionsCellValue(rule: ProgramRuleDetail | undefined): string {
    return translate('{{n}} action(s)', { n: rule?.programRuleActions?.length ?? 0 });
}

function resolveBasicDetailCells(
    rule: ProgramRuleDetail | undefined,
    ruleName: string,
    programStageName: string | null | undefined
): Array<{ label: string; value: string; mono?: boolean }> {
    return [
        { label: translate('Name'), value: resolveRuleDisplayName(rule, ruleName) },
        { label: translate('Code'), value: orDash(rule?.code), mono: true },
        { label: translate('Identifier'), value: orDash(rule?.id), mono: true },
        { label: translate('Program'), value: orDash(rule?.program?.displayName) },
        { label: translate('Program stage'), value: resolveStageName(rule, programStageName) },
        { label: translate('Priority'), value: resolvePriorityCellValue(rule) },
        { label: translate('Actions'), value: resolveActionsCellValue(rule) },
        { label: translate('Last updated'), value: resolveLastUpdatedValue(rule) },
    ];
}

export function BasicDetails({
    rule,
    ruleName,
    programStageName,
}: {
    rule: ProgramRuleDetail | undefined;
    ruleName: string;
    programStageName?: string | null;
}) {
    const cells = resolveBasicDetailCells(rule, ruleName, programStageName);
    return (
        <div className="grid grid-cols-2 gap-x-dp24 gap-y-dp12 rounded-[3px] border border-dhis2-grey-300 bg-dhis2-grey-050 p-dp16">
            {cells.map((cell) => (
                <BasicDetailCell key={cell.label} {...cell} />
            ))}
        </div>
    );
}
