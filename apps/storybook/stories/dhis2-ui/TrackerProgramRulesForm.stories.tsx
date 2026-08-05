import { D2Field, FormFeedback } from '@nnkogift/dhis2-form-utils-dhis2-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgrammeRegistrationForm } from '../../components/ProgrammeRegistrationForm';
import { withTrackerForm } from '../../decorators/withTrackerForm';
import {
    TRACKER_RULES_DEFAULT_ORG_UNIT,
    TRACKER_RULES_PROGRAM_ID,
    trackerProgramRulesMetadata,
} from '../../fixtures/trackerProgramRules';
import { trackerProgramRulesPlays } from '../../interactions/trackerProgramRulesInteractions';
import type { StoryPlayContext } from '../../interactions/trackerProgramRulesInteractions';

const plays = trackerProgramRulesPlays('dhis2-ui');

const registrationDefaults = {
    orgUnit: TRACKER_RULES_DEFAULT_ORG_UNIT,
    enrolledAt: '2024-01-15',
};

function Dhis2TrackerProgramRulesForm() {
    return <ProgrammeRegistrationForm Field={D2Field} Feedback={FormFeedback} />;
}

const meta = {
    title: 'dhis2-ui/Tracker Program Rules Example',
    component: Dhis2TrackerProgramRulesForm,
    tags: ['autodocs'],
    decorators: [
        withTrackerForm({
            programId: TRACKER_RULES_PROGRAM_ID,
            metadata: trackerProgramRulesMetadata,
            defaultValues: registrationDefaults,
        }),
    ],
} satisfies Meta<typeof Dhis2TrackerProgramRulesForm>;

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
                story: 'SHOWWARNING: an age above 120 shows a warning on the Age field.',
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
