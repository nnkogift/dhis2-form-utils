import { D2Field, FormFeedback } from '@nnkogift/dhis2-form-utils-dhis2-ui';
import '@nnkogift/dhis2-form-utils-devtools/style.css';
import { RuleDevtoolsScope, RulesPanel } from '@nnkogift/dhis2-form-utils-devtools';
import { useFormStore } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
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

function RulesPanelStory() {
    const formStore = useFormStore();

    return (
        <RuleDevtoolsScope formStore={formStore}>
            <div style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
                <ProgrammeRegistrationForm Field={D2Field} Feedback={FormFeedback} />
            </div>
            <RulesPanel
                metadata={{
                    formKind: 'tracker',
                    metadata: trackerProgramRulesMetadata,
                    programStages: TRACKER_RULES_PROGRAM_STAGES,
                }}
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
                story: 'The devtools Rules panel wired up to a live tracker registration form, fed by the `tracker-program-rules-example.json` fixture. Interact with the fields to see the panel react.',
            },
        },
    },
};
