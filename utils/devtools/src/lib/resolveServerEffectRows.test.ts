import type { RuleTraceEntry } from '@nnkogift/dhis2-form-utils-hooks';
import { ProgramRuleActionType } from '@nnkogift/dhis2-form-utils-metadata';
import { describe, expect, it } from 'vitest';
import { isValidScheduledDate, resolveServerEffectRows } from './resolveServerEffectRows';
import type { ServerRuleActionsByRule } from './resolveServerRuleActions';
import { resolveServerRuleSupport } from './resolveServerRuleSupport';

const entry = (ruleResults: RuleTraceEntry['ruleResults']): RuleTraceEntry => ({
    id: 't1',
    timestamp: 0,
    changedFields: [],
    ruleResults,
});

const actionsByRule: ServerRuleActionsByRule = {
    r1: [
        { id: 'a1', programRuleActionType: 'SENDMESSAGE', template: { id: 'tplA' } },
        { id: 'a2', programRuleActionType: 'SENDMESSAGE', template: { id: 'tplB' } },
        { id: 'a3', programRuleActionType: 'SCHEDULEEVENT', programStage: { id: 'stage1' } },
    ],
};

describe('isValidScheduledDate', () => {
    it.each(['2026-01-31', '2026-01-31T10:00:00', ' 2026-02-28 '])('accepts %s', (value) => {
        expect(isValidScheduledDate(value)).toBe(true);
    });

    it.each(['', 'tomorrow', '2026-02-30', '2026-13-01', '01/02/2026'])('rejects %s', (value) => {
        expect(isValidScheduledDate(value)).toBe(false);
    });
});

describe('resolveServerEffectRows', () => {
    const support = resolveServerRuleSupport(43);

    it('returns empty sections when nothing fired', () => {
        expect(
            resolveServerEffectRows({ traceEntry: null, actionsByRule: undefined, support })
        ).toEqual({ notifications: [], events: [], validation: [] });
    });

    it('ignores effects the server does not run', () => {
        const rows = resolveServerEffectRows({
            traceEntry: entry([
                {
                    ruleId: 'r1',
                    effects: [{ type: ProgramRuleActionType.HIDEFIELD, targetId: 'de1' }],
                },
            ]),
            actionsByRule,
            support,
        });
        expect(rows.notifications).toHaveLength(0);
        expect(rows.events).toHaveLength(0);
    });

    it('matches the nth effect of a type to the nth server action of that type', () => {
        const rows = resolveServerEffectRows({
            traceEntry: entry([
                {
                    ruleId: 'r1',
                    effects: [
                        { type: ProgramRuleActionType.SENDMESSAGE, targetId: 'SENDMESSAGE' },
                        { type: ProgramRuleActionType.SENDMESSAGE, targetId: 'SENDMESSAGE' },
                    ],
                },
            ]),
            actionsByRule,
            support,
        });
        expect(rows.notifications.map((row) => row.template?.id)).toEqual(['tplA', 'tplB']);
        expect(rows.notifications.every((row) => row.provenance === 'simulated')).toBe(true);
    });

    it('flags an unparseable SCHEDULEMESSAGE date', () => {
        const rows = resolveServerEffectRows({
            traceEntry: entry([
                {
                    ruleId: 'r1',
                    effects: [
                        {
                            type: ProgramRuleActionType.SCHEDULEMESSAGE,
                            targetId: 'SCHEDULEMESSAGE',
                            data: 'not a date',
                        },
                    ],
                },
            ]),
            actionsByRule,
            support,
        });
        expect(rows.notifications[0].scheduledDate).toEqual({ value: 'not a date', valid: false });
    });

    it('takes the event stage from the server action and gates by version', () => {
        const rows = resolveServerEffectRows({
            traceEntry: entry([
                {
                    ruleId: 'r1',
                    effects: [
                        {
                            type: ProgramRuleActionType.SCHEDULEEVENT,
                            targetId: 'SCHEDULEEVENT',
                            data: '2026-05-01',
                        },
                    ],
                },
            ]),
            actionsByRule,
            support: resolveServerRuleSupport(42),
        });
        expect(rows.events[0]).toMatchObject({
            stageId: 'stage1',
            executedByServer: false,
            requiredMinor: 43,
            scheduledDate: { value: '2026-05-01', valid: true },
        });
    });

    it('marks CREATEEVENT as not executed even though the version declares it', () => {
        const rows = resolveServerEffectRows({
            traceEntry: entry([
                {
                    ruleId: 'r2',
                    effects: [{ type: ProgramRuleActionType.CREATEEVENT, targetId: 'stage2' }],
                },
            ]),
            actionsByRule: undefined,
            support,
        });
        expect(rows.events[0]).toMatchObject({
            stageId: 'stage2',
            executedByServer: false,
            requiredMinor: null,
        });
    });

    it('tags provenance from the server report and surfaces server-only rows', () => {
        const rows = resolveServerEffectRows({
            traceEntry: entry([
                {
                    ruleId: 'r1',
                    effects: [
                        { type: ProgramRuleActionType.SENDMESSAGE, targetId: 'SENDMESSAGE' },
                        { type: ProgramRuleActionType.SHOWERROR, targetId: 'de1' },
                    ],
                },
            ]),
            actionsByRule,
            support,
            serverReport: {
                entries: [
                    { ruleId: 'r1', actionType: 'SENDMESSAGE', level: 'WARNING', message: 'ok' },
                    { ruleId: 'r9', actionType: 'SCHEDULEMESSAGE', level: 'WARNING', message: 'x' },
                    { ruleId: 'r1', actionType: 'SHOWERROR', level: 'ERROR', message: 'bad' },
                    { ruleId: 'r7', actionType: 'ASSIGN', level: 'ASSIGN_OVERWRITE', message: 'o' },
                ],
            },
        });
        expect(rows.notifications.map((row) => [row.ruleId, row.provenance])).toEqual([
            ['r1', 'server-verified'],
            ['r9', 'server-only'],
        ]);
        expect(rows.validation.map((row) => [row.ruleId, row.provenance])).toEqual([
            ['r1', 'server-verified'],
            ['r7', 'server-only'],
        ]);
    });
});
