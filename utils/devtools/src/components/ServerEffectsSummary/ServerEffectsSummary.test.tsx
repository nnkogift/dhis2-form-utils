import { fireEvent, render, screen } from '@testing-library/react';
import type { RuleTraceEntry } from '@nnkogift/dhis2-form-utils-hooks';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ServerRuleActionsByRule } from '../../lib/resolveServerRuleActions';

const config = { serverVersion: { minor: 42 } };
const actionsState: {
    actionsByRule: ServerRuleActionsByRule | undefined;
    loading: boolean;
    error: Error | undefined;
} = { actionsByRule: {}, loading: false, error: undefined };

vi.mock('@dhis2/app-runtime', () => ({ useConfig: () => config }));
vi.mock('../../hooks/useServerRuleActions', () => ({
    useServerRuleActions: () => actionsState,
}));
vi.mock('../RuleDetailsModal/index', () => ({
    RuleDetailsModal: ({ open, ruleId }: { open: boolean; ruleId: string | null }) =>
        open ? <div data-testid="rule-details">{ruleId}</div> : null,
}));

import { ServerEffectsSummary } from './ServerEffectsSummary';

const labelLookup = {
    resolveRuleName: (id: string) => `Rule ${id}`,
    resolveFieldName: (id: string) => id,
    resolveSectionName: (id: string) => id,
    resolveStageName: (id: string) => `Stage ${id}`,
};

const trace: RuleTraceEntry = {
    id: 't',
    timestamp: 0,
    changedFields: [],
    ruleResults: [
        {
            ruleId: 'r1',
            effects: [
                { type: 'SCHEDULEMESSAGE', targetId: 'SCHEDULEMESSAGE', data: 'bogus' },
                { type: 'SCHEDULEEVENT', targetId: 'stg1', data: '2026-05-01' },
            ],
        },
    ],
};

const baseProps = {
    open: true,
    onClose: vi.fn(),
    programId: 'prog',
    values: { deBp: 180 },
    labelLookup,
};

beforeEach(() => {
    actionsState.actionsByRule = {
        r1: [
            {
                id: 'a1',
                programRuleActionType: 'SCHEDULEMESSAGE',
                template: {
                    id: 'tpl',
                    displayName: 'High BP',
                    notificationRecipient: 'USER_GROUP',
                    recipientUserGroup: { id: 'ug', displayName: 'Clinicians' },
                    deliveryChannels: ['SMS', 'EMAIL'],
                    subjectTemplate: 'BP #{deBp}',
                    messageTemplate: 'Hi A{name}',
                },
            },
        ],
    };
    actionsState.loading = false;
    actionsState.error = undefined;
});

describe('ServerEffectsSummary', () => {
    it('renders nothing when closed', () => {
        const { container } = render(
            <ServerEffectsSummary {...baseProps} open={false} traceEntry={trace} />
        );
        expect(container.childElementCount).toBe(0);
    });

    it('shows the empty state when no server-side rule fired', () => {
        render(<ServerEffectsSummary {...baseProps} traceEntry={null} />);
        expect(screen.getByText('No server-side rule effects fired.')).toBeTruthy();
    });

    it('shows an error notice when the actions failed to load', () => {
        actionsState.error = new Error('boom');
        render(<ServerEffectsSummary {...baseProps} traceEntry={null} />);
        expect(screen.getByText('boom')).toBeTruthy();
    });

    it('renders notification details, the invalid-date flag and gated events', () => {
        render(
            <ServerEffectsSummary {...baseProps} traceEntry={trace} footer={<span>Confirm</span>} />
        );

        expect(screen.getByText('High BP')).toBeTruthy();
        expect(screen.getByText('USER_GROUP · Clinicians')).toBeTruthy();
        expect(screen.getByText('SMS, EMAIL')).toBeTruthy();
        expect(screen.getByText('BP 180')).toBeTruthy();
        expect(screen.getByText('A{name}', { exact: false })).toBeTruthy();
        expect(screen.getByText('Invalid date, server will skip')).toBeTruthy();
        expect(screen.getByText('Stage stg1')).toBeTruthy();
        expect(screen.getByText('Not executed by this server (requires 2.43)')).toBeTruthy();
        expect(screen.getByText('Confirm')).toBeTruthy();
    });

    it('opens the rule details modal from a row', () => {
        render(<ServerEffectsSummary {...baseProps} traceEntry={trace} />);
        fireEvent.click(screen.getAllByText('Rule r1')[0]);
        expect(screen.getByTestId('rule-details').textContent).toBe('r1');
    });

    it('lists server validation rows with provenance', () => {
        render(
            <ServerEffectsSummary
                {...baseProps}
                traceEntry={null}
                serverReport={{
                    entries: [
                        { ruleId: 'r9', actionType: 'SHOWERROR', level: 'ERROR', message: 'Bad' },
                    ],
                }}
            />
        );
        expect(screen.getByText('Bad')).toBeTruthy();
        expect(screen.getByText('Server only')).toBeTruthy();
    });
});
