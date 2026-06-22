import { D2Field } from '@dhis2-form-utils/dhis2-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { StoryPlayContext } from '../../interactions/childProgrammeInteractions';
import { ProgrammeEventForm } from '../../components/ProgrammeEventForm';
import { withEventForm } from '../../decorators/withEventForm';
import { childProgrammePlays } from '../../interactions/childProgrammeInteractions';
import {
    CHILD_PROGRAMME_STAGE_ID,
    childProgrammeStageMetadata,
} from '../../fixtures/childProgramme';

const plays = childProgrammePlays('dhis2-ui');

function Dhis2ChildProgrammeForm() {
    return <ProgrammeEventForm Field={D2Field} />;
}

const meta = {
    title: 'dhis2-ui/ChildProgrammeForm',
    component: Dhis2ChildProgrammeForm,
    tags: ['autodocs'],
    decorators: [
        withEventForm({
            programStageId: CHILD_PROGRAMME_STAGE_ID,
            metadata: childProgrammeStageMetadata,
        }),
    ],
} satisfies Meta<typeof Dhis2ChildProgrammeForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async (context: StoryPlayContext) => {
        await plays.rendersForm(context);
        await plays.fillsApgarScore(context);
    },
};

export const LowApgarWarning: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Program rule shows a warning on the Apgar comment field when the score is between 0 and 4 and no comment is provided.',
            },
        },
    },
    play: plays.lowApgarWarning,
};

export const NegativeApgarError: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Program rule shows an error on the Apgar score field when the score is below zero and no comment is provided.',
            },
        },
    },
    play: plays.negativeApgarError,
};

export const HighApgarHidesComment: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Program rule hides the Apgar comment field when the score is above 7.',
            },
        },
    },
    play: plays.highApgarHidesComment,
};

export const SelectField: Story = {
    play: plays.selectArvAtBirth,
};

export const Submit: Story = {
    play: plays.submitForm,
};
