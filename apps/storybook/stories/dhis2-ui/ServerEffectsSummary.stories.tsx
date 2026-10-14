import { Provider } from '@dhis2/app-runtime';
import { Button } from '@dhis2/ui';
import '@nnkogift/dhis2-form-utils-devtools/style.css';
import { ServerEffectsSummary } from '@nnkogift/dhis2-form-utils-devtools';
import type { RuleTraceEntry } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { useState, type ReactNode } from 'react';

const API = /^https:\/\/debug\.dhis2\.org\/api\/(\d+\/)?/;

const rules = [
    {
        id: 'ruleNotify',
        displayName: 'Notify clinician on high BP',
        programRuleActions: [
            { id: 'a1', programRuleActionType: 'SENDMESSAGE', templateUid: 'tplSend' },
            {
                id: 'a2',
                programRuleActionType: 'SCHEDULEMESSAGE',
                templateUid: 'tplSchedule',
                data: 'd2:addDays(V{event_date}, 7)',
            },
        ],
    },
    {
        id: 'ruleFollowUp',
        displayName: 'Schedule follow-up visit',
        programRuleActions: [
            {
                id: 'a3',
                programRuleActionType: 'SCHEDULEEVENT',
                programStage: { id: 'stageFollowUp', displayName: 'Follow-up' },
            },
        ],
    },
];

const templates = [
    {
        id: 'tplSend',
        displayName: 'High BP alert',
        notificationRecipient: 'USER_GROUP',
        recipientUserGroup: { id: 'ug1', displayName: 'Clinicians' },
        deliveryChannels: ['SMS', 'EMAIL'],
        subjectTemplate: 'High BP for A{patientName}',
        messageTemplate: 'Reading #{deBp} recorded on V{event_date}. Contact A{phone}.',
    },
    {
        id: 'tplSchedule',
        displayName: 'Follow-up reminder',
        notificationRecipient: 'TRACKED_ENTITY_INSTANCE',
        deliveryChannels: ['SMS'],
        subjectTemplate: 'Reminder',
        messageTemplate: 'Please return for your follow-up, A{patientName}.',
    },
];

const handlers = {
    dhis2: [
        // fallow-ignore-next-line complexity
        http.get(new RegExp(`${API.source}programRules/(\\w+)`), ({ request }) => {
            const id = new URL(request.url).pathname.split('/').pop() ?? '';
            const rule = rules.find((candidate) => candidate.id === id);
            return HttpResponse.json({
                id,
                displayName: rule?.displayName ?? id,
                condition: '#{deBp} > 140',
                program: { id: 'prog1', displayName: 'Hypertension' },
                programRuleActions: rule?.programRuleActions ?? [],
            });
        }),
        http.get(new RegExp(`${API.source}programRules$`), () =>
            HttpResponse.json({ programRules: rules })
        ),
        http.get(new RegExp(`${API.source}programNotificationTemplates`), () =>
            HttpResponse.json({ programNotificationTemplates: templates })
        ),
    ],
};

const labelLookup = {
    resolveRuleName: (id: string) => rules.find((rule) => rule.id === id)?.displayName ?? id,
    resolveFieldName: (id: string) => (id === 'deBp' ? 'Blood pressure' : id),
    resolveSectionName: (id: string) => id,
    resolveStageName: (id: string) => (id === 'stageFollowUp' ? 'Follow-up' : id),
};

const traceEntry: RuleTraceEntry = {
    id: 'trace-1',
    timestamp: 0,
    changedFields: ['deBp'],
    ruleResults: [
        {
            ruleId: 'ruleNotify',
            effects: [
                { type: 'SENDMESSAGE', targetId: 'SENDMESSAGE', data: null },
                { type: 'SCHEDULEMESSAGE', targetId: 'SCHEDULEMESSAGE', data: 'not-a-date' },
            ],
        },
        {
            ruleId: 'ruleFollowUp',
            effects: [{ type: 'SCHEDULEEVENT', targetId: 'stageFollowUp', data: '2026-11-01' }],
        },
    ],
};

const values = { deBp: 185, patientName: 'Amina' };

function Harness({ minor, children }: { minor: number; children: ReactNode }) {
    return (
        <Provider
            config={{
                baseUrl: 'https://debug.dhis2.org',
                apiVersion: minor,
                serverVersion: { major: 2, minor, full: `2.${String(minor)}.0` },
            }}
            userInfo={undefined}
            plugin={false}
            parentAlertsAdd={undefined}
            showAlertsInPlugin={false}
        >
            {children}
        </Provider>
    );
}

type StoryArgs = Partial<React.ComponentProps<typeof ServerEffectsSummary>> & { minor?: number };

function SummaryStory({ minor = 43, ...props }: StoryArgs) {
    const [open, setOpen] = useState(true);
    return (
        <Harness minor={minor}>
            <Button
                onClick={() => {
                    setOpen(true);
                }}
            >
                Open server effects
            </Button>
            <ServerEffectsSummary
                open={open}
                onClose={() => {
                    setOpen(false);
                }}
                programId="prog1"
                traceEntry={traceEntry}
                values={values}
                labelLookup={labelLookup}
                footer={<Button primary>Confirm save</Button>}
                {...props}
            />
        </Harness>
    );
}

const meta = {
    title: 'dhis2-ui/Server Effects Summary (Devtools)',
    component: SummaryStory,
    parameters: { layout: 'padded', msw: { handlers } },
} satisfies Meta<typeof SummaryStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OlderServer: Story = { args: { minor: 42 } };

export const NothingFired: Story = { args: { traceEntry: null } };

export const WithServerReport: Story = {
    args: {
        serverReport: {
            entries: [
                {
                    ruleId: 'ruleNotify',
                    actionType: 'SENDMESSAGE',
                    level: 'WARNING',
                    message: 'Queued',
                },
                {
                    ruleId: 'ruleMystery',
                    actionType: 'SCHEDULEMESSAGE',
                    level: 'WARNING',
                    message: 'Only server fired this',
                },
                {
                    ruleId: 'ruleNotify',
                    actionType: 'SHOWERROR',
                    level: 'ERROR',
                    message: 'BP out of range',
                    targetId: 'deBp',
                },
                {
                    ruleId: 'ruleAssign',
                    actionType: 'ASSIGN',
                    level: 'ASSIGN_OVERWRITE',
                    message: 'Overwrote value 120 with 150',
                },
            ],
        },
    },
};
