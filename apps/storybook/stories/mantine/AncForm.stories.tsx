import { D2Field } from '@dhis2-form-utils/mantine';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MantineProvider } from '@mantine/core';
import { ProgrammeEventForm } from '../../components/ProgrammeEventForm';
import { withEventForm } from '../../decorators/withEventForm';
import { ANC_STAGE_ID, ancStageMetadata } from '../../fixtures/anc';
import { ancPlays } from '../../interactions/ancInteractions';
import type { StoryPlayContext } from '../../interactions/ancInteractions';

const plays = ancPlays('mantine');

function MantineAncForm() {
    return <ProgrammeEventForm Field={D2Field} />;
}

const meta = {
    title: 'mantine/AncForm',
    component: MantineAncForm,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <MantineProvider>
                <Story />
            </MantineProvider>
        ),
        withEventForm({
            programStageId: ANC_STAGE_ID,
            metadata: ancStageMetadata,
        }),
    ],
} satisfies Meta<typeof MantineAncForm>;

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
                story: 'Mantine adapters surface program-rule errors but not warnings. The hemoglobin value is still persisted.',
            },
        },
    },
    play: plays.lowHemoglobinWarning,
};

export const HighHemoglobinError: Story = {
    play: plays.highHemoglobinError,
};

export const NonSmokerHidesCounselling: Story = {
    play: plays.nonSmokerHidesCounselling,
};

export const Submit: Story = {
    play: plays.submitForm,
};
