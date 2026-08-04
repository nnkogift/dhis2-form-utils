import { D2Field, FormFeedback } from '@dhis2-form-utils/mantine';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MantineProvider } from '@mantine/core';
import { ProgrammeRegistrationForm } from '../../components/ProgrammeRegistrationForm';
import { withTrackerForm } from '../../decorators/withTrackerForm';
import {
    TRACKER_RULES_DEFAULT_ORG_UNIT,
    TRACKER_RULES_PROGRAM_ID,
    trackerProgramRulesMetadata,
} from '../../fixtures/trackerProgramRules';
import { trackerProgramRulesPlays } from '../../interactions/trackerProgramRulesInteractions';
import type { StoryPlayContext } from '../../interactions/trackerProgramRulesInteractions';

const plays = trackerProgramRulesPlays('mantine');

const registrationDefaults = {
    orgUnit: TRACKER_RULES_DEFAULT_ORG_UNIT,
    enrolledAt: '2024-01-15',
};

function MantineTrackerProgramRulesForm() {
    return <ProgrammeRegistrationForm Field={D2Field} Feedback={FormFeedback} />;
}

const meta = {
    title: 'mantine/Tracker Program Rules Example',
    component: MantineTrackerProgramRulesForm,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <MantineProvider>
                <Story />
            </MantineProvider>
        ),
        withTrackerForm({
            programId: TRACKER_RULES_PROGRAM_ID,
            metadata: trackerProgramRulesMetadata,
            defaultValues: registrationDefaults,
        }),
    ],
} satisfies Meta<typeof MantineTrackerProgramRulesForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async (context: StoryPlayContext) => {
        await plays.rendersForm(context);
        await plays.fillsFirstName(context);
    },
};

export const HideFieldWhenConsentFalse: Story = {
    parameters: {
        docs: {
            description: {
                story: 'HIDEFIELD: "Notes (hide target)" is hidden while "Consent given" is unset or No, and appears once it is set to Yes.',
            },
        },
    },
    play: plays.hideFieldWhenConsentFalse,
};

export const ShowWarningWhenAgeAboveLimit: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Mantine adapters surface program-rule errors but not warnings. The age value is persisted while the (invisible) warning fires.',
            },
        },
    },
    play: plays.showWarningWhenAgeAboveLimit,
};

export const ShowErrorWhenFirstNameTooShort: Story = {
    parameters: {
        docs: {
            description: {
                story: 'SHOWERROR: a first name shorter than 2 characters shows an error.',
            },
        },
    },
    play: plays.showErrorWhenFirstNameTooShort,
};

export const AssignRiskScoreFromAge: Story = {
    parameters: {
        docs: {
            description: {
                story: 'ASSIGN: the "Risk score" attribute is kept in sync with age / 10.',
            },
        },
    },
    play: plays.assignRiskScoreFromAge,
};

export const MandatoryOccupationWhenAdult: Story = {
    parameters: {
        docs: {
            description: {
                story: 'SETMANDATORYFIELD: an age of 18 or older makes the "Occupation" attribute required.',
            },
        },
    },
    play: plays.mandatoryOccupationWhenAdult,
};

export const DisplaysRegistrationFeedback: Story = {
    parameters: {
        docs: {
            description: {
                story: 'DISPLAYTEXT: the entered first name is echoed in the enrollment feedback panel.',
            },
        },
    },
    play: plays.displaysRegistrationFeedback,
};

export const Submit: Story = {
    play: plays.submitForm,
};
