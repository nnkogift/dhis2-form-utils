import { TextInput } from '@dhis2-form-utils/mantine';
import { createEmptyFieldState } from '@dhis2-form-utils/rules';
import type { FieldStateMap } from '@dhis2-form-utils/rules';
import { MantineProvider } from '@mantine/core';
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
    decorators: [
        (Story) => (
            <MantineProvider>
                <Story />
            </MantineProvider>
        ),
    ],
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
        // Notes field is hidden — only 2 inputs should appear
        const inputs = canvas.getAllByRole('textbox');
        await expect(inputs).toHaveLength(2);
    },
};

// Exactly one CssCheck for the whole project — proves @mantine/core/styles.css loaded
export const CssCheck: Story = {
    decorators: [withFormDecorators({ fieldState: allEmpty })],
    play: async ({ canvasElement }) => {
        const root = canvasElement.ownerDocument.documentElement;
        // MantineProvider sets --mantine-color-white on :root when CSS is loaded
        const mantineColor = getComputedStyle(root).getPropertyValue('--mantine-color-white');
        await expect(mantineColor.trim()).toBe('#fff');
    },
};
