import { D2Field } from '@dhis2-form-utils/dhis2-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgrammeEventForm } from '../../components/ProgrammeEventForm';
import { withEventForm } from '../../decorators/withEventForm';
import { ANC_STAGE_ID, ancStageMetadata } from '../../fixtures/anc';
import { ancPlays } from '../../interactions/ancInteractions';
import type { StoryPlayContext } from '../../interactions/ancInteractions';

const plays = ancPlays('dhis2-ui');

function Dhis2AncForm() {
    return <ProgrammeEventForm Field={D2Field} />;
}

const meta = {
    title: 'dhis2-ui/ANC Form Example',
    component: Dhis2AncForm,
    tags: ['autodocs'],
    decorators: [
        withEventForm({
            programStageId: ANC_STAGE_ID,
            metadata: ancStageMetadata,
        }),
    ],
} satisfies Meta<typeof Dhis2AncForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async (context: StoryPlayContext) => {
        await plays.rendersForm(context);
        await plays.fillsHemoglobin(context);
    },
};

export const LowHemoglobinWarning: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Program rule shows a warning on the hemoglobin field when the value is below 9.',
            },
        },
    },
    play: plays.lowHemoglobinWarning,
};

export const HighHemoglobinError: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Program rule shows an error on the hemoglobin field when the value is above 99.',
            },
        },
    },
    play: plays.highHemoglobinError,
};

export const NonSmokerHidesCounselling: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Program rule hides the smoking cessation counselling field when the woman is not smoking.',
            },
        },
    },
    play: plays.nonSmokerHidesCounselling,
};
