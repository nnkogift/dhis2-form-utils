import { D2Field } from '@dhis2-form-utils/mantine';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { StoryPlayContext } from '../../interactions/childProgrammeInteractions';
import { MantineProvider } from '@mantine/core';
import { ProgrammeEventForm } from '../../components/ProgrammeEventForm';
import { withEventForm } from '../../decorators/withEventForm';
import { childProgrammePlays } from '../../interactions/childProgrammeInteractions';
import {
    CHILD_PROGRAMME_STAGE_ID,
    childProgrammeStageMetadata,
} from '../../fixtures/childProgramme';

const plays = childProgrammePlays('mantine');

function MantineChildProgrammeForm() {
    return <ProgrammeEventForm Field={D2Field} />;
}

const meta = {
    title: 'mantine/Child Programme Form Example',
    component: MantineChildProgrammeForm,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <MantineProvider>
                <Story />
            </MantineProvider>
        ),
        withEventForm({
            programStageId: CHILD_PROGRAMME_STAGE_ID,
            metadata: childProgrammeStageMetadata,
        }),
    ],
} satisfies Meta<typeof MantineChildProgrammeForm>;

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
                story: 'Mantine adapters surface program-rule errors but not warnings. The comment field stays visible while the score is persisted.',
            },
        },
    },
    play: plays.lowApgarWarning,
};

export const NegativeApgarError: Story = {
    play: plays.negativeApgarError,
};

export const HighApgarHidesComment: Story = {
    play: plays.highApgarHidesComment,
};

export const SelectField: Story = {
    play: plays.selectArvAtBirth,
};
