import { TextInput } from '@dhis2-form-utils/mui';
import { createEmptyFieldState } from '@dhis2-form-utils/rules';
import type { FieldStateMap } from '@dhis2-form-utils/rules';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { withFormDecorators } from '../../decorators/withFormDecorators';

function ThreeFieldForm() {
    return (
        <div>
            <TextInput name="firstName" label="First Name" />
            <TextInput name="lastName" label="Last Name" />
            <TextInput name="notes" label="Notes" />
        </div>
    );
}

const allEmpty: FieldStateMap = {
    firstName: createEmptyFieldState(),
    lastName: createEmptyFieldState(),
    notes: createEmptyFieldState(),
};

const meta = {
    component: ThreeFieldForm,
    tags: ['ai-generated'],
} satisfies Meta<typeof ThreeFieldForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    decorators: [withFormDecorators({ fieldState: allEmpty })],
};

export const WithValidation: Story = {
    decorators: [
        withFormDecorators({
            fieldState: {
                firstName: { ...createEmptyFieldState(), mandatory: true },
                lastName: { ...createEmptyFieldState(), error: 'This field is required' },
                notes: { ...createEmptyFieldState(), warning: 'Optional but recommended' },
            },
        }),
    ],
};

export const PartiallyHidden: Story = {
    decorators: [
        withFormDecorators({
            fieldState: {
                firstName: { ...createEmptyFieldState(), mandatory: true },
                lastName: createEmptyFieldState(),
                notes: { ...createEmptyFieldState(), hidden: true },
            },
        }),
    ],
    play: async ({ canvas }) => {
        // Notes is hidden — verify only 2 inputs render
        const inputs = canvas.getAllByRole('textbox');
        await expect(inputs).toHaveLength(2);
    },
};
