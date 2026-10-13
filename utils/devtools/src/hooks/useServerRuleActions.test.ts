import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ServerRuleRaw } from '../api/serverRuleActionsQuery';

const queryMock = vi.fn<(query: Record<string, unknown>, options: unknown) => Promise<unknown>>();
const engine = { query: (...args: Parameters<typeof queryMock>) => queryMock(...args) };

vi.mock('@dhis2/app-runtime', () => ({
    useDataEngine: () => engine,
}));

import { notificationTemplatesQuery, serverRuleActionsQuery } from '../api/serverRuleActionsQuery';
import { useServerRuleActions } from './useServerRuleActions';

const messagingRule: ServerRuleRaw = {
    id: 'rule1',
    displayName: 'Notify on high BP',
    programRuleActions: [
        { id: 'a1', programRuleActionType: 'SHOWWARNING' },
        { id: 'a2', programRuleActionType: 'SENDMESSAGE', templateUid: 'tplSend' },
        {
            id: 'a3',
            programRuleActionType: 'SCHEDULEMESSAGE',
            templateUid: 'tplSchedule',
            data: 'd2:addDays(V{event_date}, 7)',
            programRuleActionEvaluationTime: 'ON_DATA_ENTRY',
        },
    ],
};

const templates = [
    { id: 'tplSend', displayName: 'Send template', messageTemplate: 'Hello' },
    { id: 'tplSchedule', displayName: 'Schedule template', messageTemplate: 'Reminder' },
];

describe('useServerRuleActions', () => {
    beforeEach(() => {
        queryMock.mockReset();
    });

    it('resolves a rule with SENDMESSAGE plus SCHEDULEMESSAGE, in action order, with templates', async () => {
        queryMock.mockImplementation((query) => {
            if (query === serverRuleActionsQuery) {
                return Promise.resolve({ programRules: { programRules: [messagingRule] } });
            }
            return Promise.resolve({ templates: { programNotificationTemplates: templates } });
        });

        const { result } = renderHook(() => useServerRuleActions('prog1'));
        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        const actions = result.current.actionsByRule?.rule1;
        expect(actions?.map((a) => a.id)).toEqual(['a2', 'a3']);
        expect(actions?.[0].template?.displayName).toBe('Send template');
        expect(actions?.[1].template?.displayName).toBe('Schedule template');
        expect(actions?.[1].programRuleActionEvaluationTime).toBe('ON_DATA_ENTRY');

        expect(queryMock).toHaveBeenCalledTimes(2);
        expect(queryMock).toHaveBeenNthCalledWith(1, serverRuleActionsQuery, {
            variables: { programId: 'prog1' },
        });
        expect(queryMock).toHaveBeenNthCalledWith(2, notificationTemplatesQuery, {
            variables: { templateUids: ['tplSend', 'tplSchedule'] },
        });
    });

    it('does not request templates when no rule references one', async () => {
        queryMock.mockResolvedValue({
            programRules: {
                programRules: [
                    {
                        id: 'rule2',
                        programRuleActions: [
                            { id: 'b1', programRuleActionType: 'SCHEDULEEVENT' },
                            { id: 'b2', programRuleActionType: 'HIDEFIELD' },
                        ],
                    },
                ],
            },
        });

        const { result } = renderHook(() => useServerRuleActions('prog1'));
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.actionsByRule?.rule2.map((a) => a.id)).toEqual(['b1']);
        expect(queryMock).toHaveBeenCalledTimes(1);
    });

    it('does not fetch while disabled', () => {
        const { result } = renderHook(() => useServerRuleActions('prog1', { enabled: false }));

        expect(result.current.loading).toBe(false);
        expect(queryMock).not.toHaveBeenCalled();
    });

    it('surfaces request failures as an error', async () => {
        queryMock.mockRejectedValue(new Error('forbidden'));

        const { result } = renderHook(() => useServerRuleActions('prog1'));
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error?.message).toBe('forbidden');
        expect(result.current.actionsByRule).toBeUndefined();
    });
});
