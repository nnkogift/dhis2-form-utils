import type { RuleTraceEntry } from '@nnkogift/dhis2-form-utils-hooks';
import { ProgramRuleActionType } from '@nnkogift/dhis2-form-utils-metadata';
import type { NotificationTemplate } from '../api/serverRuleActionsQuery';
import type { ServerRuleAction, ServerRuleActionsByRule } from './resolveServerRuleActions';
import {
    DECLARED_BUT_NOT_EXECUTED_ACTIONS,
    type ServerRuleSupport,
} from './resolveServerRuleSupport';
import type { ServerReportEntry, ServerVerification } from './serverVerification';

export type EffectProvenance = 'simulated' | 'server-verified' | 'server-only';

export type ServerEffectSection = 'notifications' | 'events';

export type ScheduledDate = { value: string; valid: boolean };

export type ServerEffectRow = {
    key: string;
    ruleId: string;
    section: ServerEffectSection;
    actionType: ProgramRuleActionType;
    provenance: EffectProvenance;
    /** False when this server version doesn't run the action; the row is shown greyed out. */
    executedByServer: boolean;
    /** Minor version that introduces server support, when the action simply isn't there yet. */
    requiredMinor: number | null;
    template?: NotificationTemplate;
    /** Program stage uid (events) from the simulated effect, falling back to the server action's. */
    stageId?: string;
    /** Evaluated date of SCHEDULEMESSAGE / SCHEDULEEVENT; undefined for other actions. */
    scheduledDate?: ScheduledDate;
};

export type ServerValidationRow = {
    key: string;
    ruleId: string;
    provenance: EffectProvenance;
    entry: ServerReportEntry;
};

export type ServerEffectRows = {
    notifications: ServerEffectRow[];
    events: ServerEffectRow[];
    validation: ServerValidationRow[];
};

const SECTION_BY_TYPE: ReadonlyMap<string, ServerEffectSection> = new Map([
    [ProgramRuleActionType.SENDMESSAGE, 'notifications'],
    [ProgramRuleActionType.SCHEDULEMESSAGE, 'notifications'],
    [ProgramRuleActionType.SCHEDULEEVENT, 'events'],
    [ProgramRuleActionType.CREATEEVENT, 'events'],
]);

const SCHEDULED_DATE_TYPES: ReadonlySet<string> = new Set([
    ProgramRuleActionType.SCHEDULEMESSAGE,
    ProgramRuleActionType.SCHEDULEEVENT,
]);

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

/** Valid when it starts with a real calendar date (`yyyy-MM-dd`); the server drops anything else. */
export function isValidScheduledDate(value: string): boolean {
    const match = ISO_DATE_PATTERN.exec(value.trim());
    if (!match) {
        return false;
    }
    const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
    const date = new Date(Date.UTC(year, month - 1, day));
    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
}

export type ResolveServerEffectRowsInput = {
    traceEntry: RuleTraceEntry | null;
    actionsByRule: ServerRuleActionsByRule | undefined;
    support: ServerRuleSupport;
    serverReport?: ServerVerification;
};

function resolveGate(
    type: ProgramRuleActionType,
    support: ServerRuleSupport
): Pick<ServerEffectRow, 'executedByServer' | 'requiredMinor'> {
    const executedByServer =
        support.isServerExecuted(type) && !DECLARED_BUT_NOT_EXECUTED_ACTIONS.has(type);
    const requiredMinor = support.isServerExecuted(type) ? null : support.minVersionFor(type);
    return { executedByServer, requiredMinor };
}

function reportKey(ruleId: string, actionType: string): string {
    return `${ruleId}::${actionType}`;
}

function buildRow(
    ruleId: string,
    index: number,
    effect: { type: string; targetId?: string; data?: string | null },
    action: ServerRuleAction | undefined,
    provenance: EffectProvenance,
    support: ServerRuleSupport
): ServerEffectRow {
    const type = effect.type as ProgramRuleActionType;
    const isEvent = SECTION_BY_TYPE.get(type) === 'events';
    const dateValue = SCHEDULED_DATE_TYPES.has(type) ? effect.data : undefined;

    return {
        key: `${ruleId}:${type}:${String(index)}:${provenance}`,
        ruleId,
        section: SECTION_BY_TYPE.get(type) ?? 'notifications',
        actionType: type,
        provenance,
        ...resolveGate(type, support),
        template: action?.template,
        stageId: isEvent ? (action?.programStage?.id ?? effect.targetId) : undefined,
        scheduledDate:
            dateValue === undefined || dateValue === null
                ? undefined
                : { value: dateValue, valid: isValidScheduledDate(dateValue) },
    };
}

/** Effects carry no action id: the nth effect of a type is the nth server action of that type. */
function findNthAction(
    actions: ServerRuleAction[] | undefined,
    type: string,
    ordinal: number
): ServerRuleAction | undefined {
    return (actions ?? []).filter((candidate) => candidate.programRuleActionType === type)[ordinal];
}

function collectSimulatedRows(
    { traceEntry, actionsByRule, support }: ResolveServerEffectRowsInput,
    reportedKeys: ReadonlySet<string>
): ServerEffectRow[] {
    const rows: ServerEffectRow[] = [];

    for (const { ruleId, effects } of traceEntry?.ruleResults ?? []) {
        const seenByType = new Map<string, number>();
        for (const effect of effects) {
            if (!SECTION_BY_TYPE.has(effect.type)) {
                continue;
            }
            const ordinal = seenByType.get(effect.type) ?? 0;
            seenByType.set(effect.type, ordinal + 1);

            const action = findNthAction(actionsByRule?.[ruleId], effect.type, ordinal);
            const provenance = reportedKeys.has(reportKey(ruleId, effect.type))
                ? 'server-verified'
                : 'simulated';
            rows.push(buildRow(ruleId, rows.length, effect, action, provenance, support));
        }
    }

    return rows;
}

function collectServerOnlyRows(
    input: ResolveServerEffectRowsInput,
    simulated: ServerEffectRow[]
): ServerEffectRow[] {
    const simulatedKeys = new Set(simulated.map((row) => reportKey(row.ruleId, row.actionType)));
    const rows: ServerEffectRow[] = [];

    for (const { ruleId, actionType } of input.serverReport?.entries ?? []) {
        const key = reportKey(ruleId, actionType);
        if (!SECTION_BY_TYPE.has(actionType) || simulatedKeys.has(key)) {
            continue;
        }
        simulatedKeys.add(key);
        const action = input.actionsByRule?.[ruleId]?.find(
            (candidate) => candidate.programRuleActionType === actionType
        );
        rows.push(
            buildRow(
                ruleId,
                rows.length,
                { type: actionType },
                action,
                'server-only',
                input.support
            )
        );
    }

    return rows;
}

function collectValidationRows({
    traceEntry,
    serverReport,
}: ResolveServerEffectRowsInput): ServerValidationRow[] {
    const simulatedKeys = new Set(
        (traceEntry?.ruleResults ?? []).flatMap(({ ruleId, effects }) =>
            effects.map((effect) => reportKey(ruleId, effect.type))
        )
    );

    return (serverReport?.entries ?? [])
        .filter((entry) => !SECTION_BY_TYPE.has(entry.actionType))
        .map((entry, index) => ({
            key: `${entry.ruleId}:${entry.actionType}:${String(index)}`,
            ruleId: entry.ruleId,
            provenance: simulatedKeys.has(reportKey(entry.ruleId, entry.actionType))
                ? 'server-verified'
                : 'server-only',
            entry,
        }));
}

/**
 * Joins the simulated trace, the server-side rule actions and the optional server report into
 * the rows shown by the server effects summary.
 */
export function resolveServerEffectRows(input: ResolveServerEffectRowsInput): ServerEffectRows {
    const reportedKeys = new Set(
        (input.serverReport?.entries ?? []).map(({ ruleId, actionType }) =>
            reportKey(ruleId, actionType)
        )
    );
    const simulated = collectSimulatedRows(input, reportedKeys);
    const rows = [...simulated, ...collectServerOnlyRows(input, simulated)];

    return {
        notifications: rows.filter((row) => row.section === 'notifications'),
        events: rows.filter((row) => row.section === 'events'),
        validation: collectValidationRows(input),
    };
}
