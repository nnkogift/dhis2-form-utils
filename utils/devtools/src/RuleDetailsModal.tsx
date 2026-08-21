import { Button, ButtonStrip, CircularLoader, Modal, ModalContent } from '@dhis2/ui';
import { EFFECT_ICONS, getEffectVisual } from './effectStyles';
import { translate } from './i18n';
import type { ProgramRuleActionDetail, ProgramRuleDetail } from './programRuleDetailQuery';
import { useProgramRuleDetail } from './useProgramRuleDetail';

export type RuleDetailsStatus = 'firing' | 'idle' | 'out-of-scope';

/**
 * Structural subset of `ProgramRuleVariable` (event) / the tracker `programRuleVariables` entry
 * shape — those two are distinct generated types (tracker variables never carry `dataElement`),
 * so this only asks for what condition-token resolution actually needs.
 */
export type ProgramRuleVariableLike = {
    name?: string;
    dataElement?: { displayName?: string };
    trackedEntityAttribute?: { displayName?: string };
};

export type RuleDetailsModalProps = {
    open: boolean;
    onClose: () => void;
    ruleId: string | null;
    /** Already known from the catalog list — shown immediately, before the detail fetch resolves. */
    ruleName: string;
    status: RuleDetailsStatus;
    programStageName?: string | null;
    programRuleVariables: readonly ProgramRuleVariableLike[];
};

const EM_DASH = '—';

function formatTimestamp(value: string | undefined): string | null {
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

function resolveStatusChip(status: RuleDetailsStatus): { label: string; className: string } {
    switch (status) {
        case 'firing':
            return {
                label: translate('Firing'),
                className: 'bg-dhis2-teal-100 text-dhis2-teal-900',
            };
        case 'idle':
            return { label: translate('Idle'), className: 'bg-dhis2-grey-200 text-dhis2-grey-700' };
        case 'out-of-scope':
            return {
                label: translate('Out of scope'),
                className: 'bg-dhis2-grey-200 text-dhis2-grey-600',
            };
    }
}

type VariableKind =
    | 'Data element'
    | 'Tracked entity attribute'
    | 'Environment variable'
    | 'Function';

type VariableChip = {
    token: string;
    kind: VariableKind;
    label: string;
    className: string;
};

const VARIABLE_PATTERNS: Array<{ pattern: RegExp; kind: VariableKind; className: string }> = [
    {
        pattern: /#\{[^}]*\}/g,
        kind: 'Data element',
        className: 'bg-dhis2-blue-100 text-dhis2-blue-900',
    },
    {
        pattern: /A\{[^}]*\}/g,
        kind: 'Tracked entity attribute',
        className: 'bg-dhis2-teal-100 text-dhis2-teal-900',
    },
    {
        pattern: /V\{[^}]*\}/g,
        kind: 'Environment variable',
        className: 'bg-dhis2-grey-200 text-dhis2-grey-900',
    },
    {
        pattern: /d2:\w+(?=\()/g,
        kind: 'Function',
        className: 'bg-dhis2-yellow-100 text-dhis2-yellow-900',
    },
];

const RESOLVABLE_VARIABLE_KINDS: ReadonlySet<VariableKind> = new Set([
    'Data element',
    'Tracked entity attribute',
]);

function resolveVariableDisplayName(
    name: string,
    programRuleVariables: readonly ProgramRuleVariableLike[]
): string | undefined {
    const variable = programRuleVariables.find((candidate) => candidate.name === name);
    return variable?.dataElement?.displayName ?? variable?.trackedEntityAttribute?.displayName;
}

/** `#{name}`/`A{name}` reference a program rule *variable* name, not a metadata uid directly — resolve via `programRuleVariables`. */
function resolveVariableToken(
    token: string,
    kind: VariableKind,
    programRuleVariables: readonly ProgramRuleVariableLike[]
): string {
    if (kind === 'Function') {
        return `${token}()`;
    }
    if (!RESOLVABLE_VARIABLE_KINDS.has(kind)) {
        return token;
    }
    return resolveVariableDisplayName(token.slice(2, -1), programRuleVariables) ?? token;
}

function matchDistinctTokens(condition: string, pattern: RegExp, seen: Set<string>): string[] {
    const matches = condition.match(pattern) ?? [];
    const distinct = matches.filter((token) => !seen.has(token));
    for (const token of distinct) {
        seen.add(token);
    }
    return distinct;
}

function parseConditionVariables(
    condition: string | undefined,
    programRuleVariables: readonly ProgramRuleVariableLike[]
): VariableChip[] {
    if (!condition) {
        return [];
    }
    const seen = new Set<string>();
    return VARIABLE_PATTERNS.flatMap(({ pattern, kind, className }) =>
        matchDistinctTokens(condition, pattern, seen).map((token) => ({
            token,
            kind,
            label: resolveVariableToken(token, kind, programRuleVariables),
            className,
        }))
    );
}

type ActionTarget = { label: string; value: string };
type ActionTargetRef = { id: string; displayName?: string } | undefined;

/** Checked in this order — an action only ever populates one of these six target kinds. */
const ACTION_TARGET_RESOLVERS: Array<{
    label: string;
    getRef: (action: ProgramRuleActionDetail) => ActionTargetRef;
}> = [
    { label: 'Data element', getRef: (action) => action.dataElement },
    { label: 'Tracked entity attribute', getRef: (action) => action.trackedEntityAttribute },
    { label: 'Program stage section', getRef: (action) => action.programStageSection },
    { label: 'Program stage', getRef: (action) => action.programStage },
    { label: 'Option', getRef: (action) => action.option },
    { label: 'Option group', getRef: (action) => action.optionGroup },
];

function formatActionTargetValue(ref: NonNullable<ActionTargetRef>): string {
    return `${ref.displayName ?? ref.id} · ${ref.id}`;
}

function resolveActionTarget(action: ProgramRuleActionDetail): ActionTarget | null {
    for (const { label, getRef } of ACTION_TARGET_RESOLVERS) {
        const ref = getRef(action);
        if (ref?.id) {
            return { label: translate(label), value: formatActionTargetValue(ref) };
        }
    }
    return null;
}

function BasicDetailCell({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="min-w-0">
            <p className="m-0 text-xs text-dhis2-grey-600">{label}</p>
            <p className={`m-0 mt-[2px] text-sm text-dhis2-grey-900 ${mono ? 'font-mono' : ''}`}>
                {value}
            </p>
        </div>
    );
}

type DetailRow = { label: string; value: string; mono?: boolean };

const FEEDBACK_ACTION_TYPES: ReadonlySet<string> = new Set(['DISPLAYTEXT', 'DISPLAYKEYVALUEPAIR']);

function resolveDataRow(action: ProgramRuleActionDetail): DetailRow | null {
    return action.data
        ? { label: translate('Data (expression)'), value: action.data, mono: true }
        : null;
}

function resolveContentRow(action: ProgramRuleActionDetail): DetailRow | null {
    const showContent =
        Boolean(action.content) && FEEDBACK_ACTION_TYPES.has(action.programRuleActionType);
    return showContent
        ? { label: translate('Content (static text)'), value: action.content ?? '' }
        : null;
}

function resolveLocationRow(action: ProgramRuleActionDetail): DetailRow | null {
    return action.location
        ? { label: translate('Location'), value: action.location, mono: true }
        : null;
}

function resolveActionRows(action: ProgramRuleActionDetail): DetailRow[] {
    const rows = [
        resolveActionTarget(action),
        resolveDataRow(action),
        resolveContentRow(action),
        resolveLocationRow(action),
    ];
    return rows.filter((row): row is DetailRow => row !== null);
}

function ActionCard({ action, index }: { action: ProgramRuleActionDetail; index: number }) {
    const type = action.programRuleActionType;
    const visual = getEffectVisual(type);
    const Icon = EFFECT_ICONS[visual.variant];
    const rows = resolveActionRows(action);

    return (
        <div
            className="relative rounded-[3px] border border-dhis2-grey-300 bg-white py-dp12 pe-dp16 ps-dp16 shadow-[0_1px_2px_rgb(0_0_0/4%)]"
            style={{ borderInlineStartWidth: 3, borderInlineStartColor: visual.edgeStroke }}
        >
            <div className="mb-dp12 flex items-center justify-between gap-dp8">
                <span
                    className={`inline-flex items-center gap-[4px] rounded-[4px] px-dp8 py-[2px] text-xs font-semibold ${visual.tagClassName}`}
                >
                    <Icon />
                    {type}
                </span>
                <span className="text-[11px] uppercase tracking-wide text-dhis2-grey-600">
                    {translate('Action {{n}}', { n: index + 1 })}
                </span>
            </div>
            <div className="flex flex-col gap-dp10">
                {rows.map((row) => (
                    <div key={row.label} className="grid grid-cols-[172px_minmax(0,1fr)] gap-dp10">
                        <span className="text-xs text-dhis2-grey-600">{row.label}</span>
                        <span
                            className={`min-w-0 break-words text-sm ${row.mono ? 'font-mono text-[12px]' : ''}`}
                        >
                            {row.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function orDash(value: string | undefined): string {
    return value ?? EM_DASH;
}

function resolveDetailDisplayName(rule: ProgramRuleDetail | undefined): string | undefined {
    return rule?.displayName;
}

function resolveDetailName(rule: ProgramRuleDetail | undefined): string | undefined {
    return rule?.name;
}

/** Shared by the modal title and the "Name" basic-detail cell — both fall back the same way. */
function resolveRuleDisplayName(rule: ProgramRuleDetail | undefined, fallback: string): string {
    const displayName = resolveDetailDisplayName(rule) ?? resolveDetailName(rule);
    return displayName ?? fallback;
}

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

function BasicDetails({
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

const SECTION_HEADING_CLASS =
    'm-0 mb-dp8 text-[13px] font-bold uppercase tracking-wide text-dhis2-grey-700';

/**
 * `Modal` already renders its own absolutely-positioned close button and wraps every child in
 * a uniform 24px padding box — this bleeds that padding away on its own edges (negative margin)
 * and re-applies the design's own padding, instead of stacking a second layer of padding (and
 * a duplicate close icon) inside it. A plain div defaults to flex `order: 0`, which already
 * sorts before `ModalContent` (order 2) and the footer below (explicit `order: 3`).
 */
function RuleDetailsHeader({
    title,
    chip,
    description,
}: {
    title: string;
    chip: { label: string; className: string };
    description?: string;
}) {
    return (
        <div className="-mx-dp24 -mt-dp24 mb-0 border-b border-dhis2-grey-300 px-dp24 pb-dp16 pe-[44px] pt-[20px]">
            <p className="m-0 text-[11px] font-bold uppercase tracking-[.09em] text-dhis2-grey-600">
                {translate('Program rule')}
            </p>
            <div className="mt-[6px] flex flex-wrap items-center gap-dp8">
                <h2 className="m-0 text-xl font-medium leading-[1.3] text-dhis2-grey-900">
                    {title}
                </h2>
                <span
                    className={`rounded-[4px] px-dp8 py-[2px] text-xs font-semibold ${chip.className}`}
                >
                    {chip.label}
                </span>
            </div>
            {description ? (
                <p
                    className="m-0 mt-[6px] text-sm text-dhis2-grey-700"
                    style={{ textWrap: 'pretty' }}
                >
                    {description}
                </p>
            ) : null}
        </div>
    );
}

function ConditionSection({
    condition,
    variables,
}: {
    condition: string | undefined;
    variables: VariableChip[];
}) {
    return (
        <section>
            <h3 className={SECTION_HEADING_CLASS}>{translate('Condition')}</h3>
            <pre className="m-0 whitespace-pre-wrap break-words rounded-[3px] border border-dhis2-grey-300 bg-dhis2-grey-200 px-dp16 py-[14px] font-mono text-[13px] leading-[1.6] text-dhis2-grey-900">
                {condition ?? EM_DASH}
            </pre>
            {variables.length ? (
                <div className="mt-dp12">
                    <p className="m-0 mb-dp8 text-xs text-dhis2-grey-600">
                        {translate('Variables referenced')}
                    </p>
                    <div className="flex flex-wrap gap-dp8">
                        {variables.map((variable) => (
                            <span
                                key={variable.token}
                                className={`inline-flex items-center gap-[4px] rounded-full px-dp8 py-[2px] text-xs ${variable.className}`}
                            >
                                <span className="font-mono font-medium">{variable.label}</span>
                                <span className="opacity-70">{translate(variable.kind)}</span>
                            </span>
                        ))}
                    </div>
                </div>
            ) : null}
        </section>
    );
}

function ActionsSection({ actions }: { actions: ProgramRuleActionDetail[] }) {
    return (
        <section>
            <h3 className={SECTION_HEADING_CLASS}>{translate('Actions')}</h3>
            <div className="flex flex-col gap-dp12">
                {actions.map((action, index) => (
                    <ActionCard key={action.id} action={action} index={index} />
                ))}
            </div>
        </section>
    );
}

function RuleDetailsContent({
    detail,
    ruleName,
    programStageName,
    variables,
}: {
    detail: ProgramRuleDetail;
    ruleName: string;
    programStageName?: string | null;
    variables: VariableChip[];
}) {
    return (
        <div className="flex flex-col gap-dp24 pt-dp16">
            <section>
                <h3 className={SECTION_HEADING_CLASS}>{translate('Basic details')}</h3>
                <BasicDetails
                    rule={detail}
                    ruleName={ruleName}
                    programStageName={programStageName}
                />
            </section>
            <ConditionSection condition={detail.condition} variables={variables} />
            <ActionsSection actions={detail.programRuleActions ?? []} />
        </div>
    );
}

function RuleDetailsBody({
    detail,
    loading,
    error,
    ruleName,
    programStageName,
    variables,
}: {
    detail: ProgramRuleDetail | undefined;
    loading: boolean;
    error: Error | undefined;
    ruleName: string;
    programStageName?: string | null;
    variables: VariableChip[];
}) {
    if (loading) {
        return (
            <div className="flex min-h-[280px] items-center justify-center">
                <CircularLoader small />
            </div>
        );
    }
    if (error) {
        return (
            <p className="m-0 text-sm text-dhis2-red-700">
                {translate('Could not load this rule: {{message}}', { message: error.message })}
            </p>
        );
    }
    if (!detail) {
        return null;
    }
    return (
        <RuleDetailsContent
            detail={detail}
            ruleName={ruleName}
            programStageName={programStageName}
            variables={variables}
        />
    );
}

/**
 * A plain div (not `ModalActions`) — `ModalActions` sets `align-self: flex-end`, which
 * shrink-wraps it to its content width instead of stretching full-width, so the bleed-to-edge
 * trick here would compute against that shrunk box. `order: 3` reproduces `ModalActions`'
 * position in the flex column without that side effect.
 */
function RuleDetailsFooter({ onClose }: { onClose: () => void }) {
    return (
        <div
            style={{ order: 3 }}
            className="-mx-dp24 -mb-dp24 mt-dp16 flex items-center justify-between gap-dp12 border-t border-dhis2-grey-300 bg-dhis2-grey-050 px-dp24 py-[14px]"
        >
            <p className="m-0 text-sm text-dhis2-grey-600">
                {translate('Read-only view. Edit rules in the Maintenance app.')}
            </p>
            <ButtonStrip>
                <Button secondary onClick={onClose}>
                    {translate('Close')}
                </Button>
            </ButtonStrip>
        </div>
    );
}

function resolveActiveRuleId(open: boolean, ruleId: string | null): string | null {
    return open ? ruleId : null;
}

function shouldRenderModal(open: boolean, ruleId: string | null): boolean {
    return open && ruleId != null;
}

export function RuleDetailsModal({
    open,
    onClose,
    ruleId,
    ruleName,
    status,
    programStageName,
    programRuleVariables,
}: RuleDetailsModalProps) {
    const { detail, loading, error } = useProgramRuleDetail(resolveActiveRuleId(open, ruleId));

    if (!shouldRenderModal(open, ruleId)) {
        return null;
    }

    const chip = resolveStatusChip(status);
    const variables = parseConditionVariables(detail?.condition, programRuleVariables);
    const title = resolveRuleDisplayName(detail, ruleName);

    return (
        <Modal position="middle" onClose={onClose}>
            <RuleDetailsHeader title={title} chip={chip} description={detail?.description} />
            <ModalContent>
                <RuleDetailsBody
                    detail={detail}
                    loading={loading}
                    error={error}
                    ruleName={ruleName}
                    programStageName={programStageName}
                    variables={variables}
                />
            </ModalContent>
            <RuleDetailsFooter onClose={onClose} />
        </Modal>
    );
}
