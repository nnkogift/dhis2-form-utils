import { SegmentedControl } from '@dhis2/ui';
import { D2Field, FormFeedback } from '@nnkogift/dhis2-form-utils-dhis2-ui';
import '@nnkogift/dhis2-form-utils-devtools/style.css';
import { RuleDevtoolsScope, RulesPanel } from '@nnkogift/dhis2-form-utils-devtools';
import { useFormStore } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ProgrammeRegistrationForm } from '../../components/ProgrammeRegistrationForm';
import { withTrackerForm } from '../../decorators/withTrackerForm';
import {
    TRACKER_RULES_DEFAULT_ORG_UNIT,
    TRACKER_RULES_PROGRAM_ID,
    TRACKER_RULES_PROGRAM_STAGES,
    trackerProgramRulesMetadata,
} from '../../fixtures/trackerProgramRules';

const registrationDefaults = {
    orgUnit: TRACKER_RULES_DEFAULT_ORG_UNIT,
    enrolledAt: '2024-01-15',
};

const STAGE_SELECTOR_OPTIONS = [
    { label: 'Registration', value: '' },
    ...TRACKER_RULES_PROGRAM_STAGES.filter((stage) => stage.id).map((stage) => ({
        label: stage.displayName ?? stage.id ?? '',
        value: stage.id ?? '',
    })),
];

function resolveStageLabel(activeStageId: string): string {
    return (
        STAGE_SELECTOR_OPTIONS.find((option) => option.value === activeStageId)?.label ??
        activeStageId
    );
}

function StageSlotPlaceholder({ stageLabel }: { stageLabel: string }) {
    return (
        <div
            style={{
                padding: 16,
                border: '1px dashed #a0a7ae',
                borderRadius: 4,
                color: '#333',
            }}
        >
            <p style={{ margin: 0, fontWeight: 500 }}>Viewing: {stageLabel}</p>
            <p style={{ margin: '8px 0 0' }}>
                This story only wires a live form for the registration slot — there&apos;s no
                event-stage form here to render. Switching stages simulates the host app navigating
                to that stage&apos;s slot so you can see <code>RulesPanel</code>
                &apos;s scope filter react to <code>activeProgramStageId</code> below.
            </p>
        </div>
    );
}

function ActiveSlot({ activeStageId }: { activeStageId: string }) {
    if (activeStageId === '') {
        return <ProgrammeRegistrationForm Field={D2Field} Feedback={FormFeedback} />;
    }
    return <StageSlotPlaceholder stageLabel={resolveStageLabel(activeStageId)} />;
}

function RulesPanelStory() {
    const formStore = useFormStore();
    const [activeStageId, setActiveStageId] = useState('');

    return (
        <RuleDevtoolsScope formStore={formStore}>
            <div style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
                <div style={{ marginBottom: 16 }}>
                    <SegmentedControl
                        options={STAGE_SELECTOR_OPTIONS}
                        selected={activeStageId}
                        onChange={({ value }) => {
                            setActiveStageId(value);
                        }}
                    />
                </div>
                <ActiveSlot activeStageId={activeStageId} />
            </div>
            <RulesPanel
                metadata={{
                    formKind: 'tracker',
                    metadata: trackerProgramRulesMetadata,
                    programStages: TRACKER_RULES_PROGRAM_STAGES,
                }}
                activeProgramStageId={activeStageId === '' ? null : activeStageId}
            />
        </RuleDevtoolsScope>
    );
}

const meta = {
    title: 'dhis2-ui/Rules Panel (Devtools)',
    component: RulesPanelStory,
    tags: ['autodocs'],
    decorators: [
        withTrackerForm({
            programId: TRACKER_RULES_PROGRAM_ID,
            metadata: trackerProgramRulesMetadata,
            defaultValues: registrationDefaults,
            containerStyle: { display: 'flex', gap: 16, padding: 16, height: 640 },
        }),
    ],
} satisfies Meta<typeof RulesPanelStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    parameters: {
        docs: {
            description: {
                story: 'The devtools Rules panel wired up to a live tracker registration form, fed by the `tracker-program-rules-example.json` fixture. Interact with the fields to see the panel react. Use the segmented control above the form to simulate an external stage selector — it drives the `activeProgramStageId` prop so stage-scoped rules correctly report in/out of scope for the currently "visible" stage.',
            },
        },
    },
};
