import { D2Field } from '@dhis2-form-utils/mui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgrammeRegistrationForm } from '../../components/ProgrammeRegistrationForm';
import { withTrackerForm } from '../../decorators/withTrackerForm';
import {
    CHILD_PROGRAMME_PROGRAM_ID,
    CHILD_REGISTRATION_DEFAULT_ORG_UNIT,
    childProgrammeProgramMetadata,
} from '../../fixtures/childProgramme';
import { childProgrammeRegistrationPlays } from '../../interactions/childProgrammeRegistrationInteractions';
import type { StoryPlayContext } from '../../interactions/childProgrammeRegistrationInteractions';

const plays = childProgrammeRegistrationPlays('mui');

const registrationDefaults = {
    orgUnit: CHILD_REGISTRATION_DEFAULT_ORG_UNIT,
    enrolledAt: '2024-01-15',
    occurredAt: '2024-01-01',
};

function MuiChildProgrammeRegistrationForm() {
    return <ProgrammeRegistrationForm Field={D2Field} />;
}

const meta = {
    title: 'mui/Child Programme Registration Example',
    component: MuiChildProgrammeRegistrationForm,
    tags: ['autodocs'],
    decorators: [
        withTrackerForm({
            programId: CHILD_PROGRAMME_PROGRAM_ID,
            metadata: childProgrammeProgramMetadata,
            defaultValues: registrationDefaults,
        }),
    ],
} satisfies Meta<typeof MuiChildProgrammeRegistrationForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async (context: StoryPlayContext) => {
        await plays.rendersForm(context);
        await plays.fillsNameFields(context);
    },
};

export const GenderSelect: Story = {
    play: plays.selectsGender,
};

export const Submit: Story = {
    play: plays.submitForm,
};
