import { ProgramRuleActionType } from '@nnkogift/dhis2-form-utils-metadata';
import { describe, expect, it } from 'vitest';
import {
    DECLARED_BUT_NOT_EXECUTED_ACTIONS,
    resolveServerRuleSupport,
} from './resolveServerRuleSupport';

const BASE_ACTIONS = [
    'SENDMESSAGE',
    'SCHEDULEMESSAGE',
    'ASSIGN',
    'SETMANDATORYFIELD',
    'SHOWERROR',
    'SHOWWARNING',
    'ERRORONCOMPLETE',
    'WARNINGONCOMPLETE',
];
const EVENT_ACTIONS = ['SCHEDULEEVENT', 'CREATEEVENT'];

describe('resolveServerRuleSupport', () => {
    it.each([
        { minor: 0, expected: BASE_ACTIONS },
        { minor: 40, expected: BASE_ACTIONS },
        { minor: 41, expected: BASE_ACTIONS },
        { minor: 42, expected: BASE_ACTIONS },
        { minor: 43, expected: [...BASE_ACTIONS, ...EVENT_ACTIONS] },
        { minor: 44, expected: [...BASE_ACTIONS, ...EVENT_ACTIONS] },
    ])('resolves the server-executed actions for minor $minor', ({ minor, expected }) => {
        const { serverActions } = resolveServerRuleSupport(minor);

        expect([...serverActions].sort()).toEqual([...expected].sort());
    });

    it.each([
        { minor: 0, type: ProgramRuleActionType.ASSIGN, expected: true },
        { minor: 42, type: ProgramRuleActionType.SCHEDULEEVENT, expected: false },
        { minor: 43, type: ProgramRuleActionType.SCHEDULEEVENT, expected: true },
        { minor: 43, type: ProgramRuleActionType.HIDEFIELD, expected: false },
    ])('isServerExecuted($type) at minor $minor is $expected', ({ minor, type, expected }) => {
        expect(resolveServerRuleSupport(minor).isServerExecuted(type)).toBe(expected);
    });

    it.each([
        { type: ProgramRuleActionType.ASSIGN, expected: 40 },
        { type: ProgramRuleActionType.SCHEDULEEVENT, expected: 43 },
        { type: ProgramRuleActionType.CREATEEVENT, expected: 43 },
        { type: ProgramRuleActionType.HIDEFIELD, expected: null },
    ])('minVersionFor($type) is $expected', ({ type, expected }) => {
        expect(resolveServerRuleSupport(42).minVersionFor(type)).toBe(expected);
    });

    it('flags CREATEEVENT as declared but not executed', () => {
        expect(DECLARED_BUT_NOT_EXECUTED_ACTIONS.has(ProgramRuleActionType.CREATEEVENT)).toBe(true);
    });
});
