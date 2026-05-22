import { TextInput } from '@dhis2-form-utils/mantine';
import { MantineProvider } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react';
import { fieldStateFor, withFormDecorators } from '../../decorators/withFormDecorators';

const meta: Meta<typeof TextInput> = {
    title: 'mantine/TextInput',
    component: TextInput,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <MantineProvider>
                <Story />
            </MantineProvider>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof TextInput>;

export const Default: Story = {
    decorators: [withFormDecorators({ fieldState: fieldStateFor('sampleField', {}) })],
    args: { name: 'sampleField', label: 'Sample Field' },
};

export const Mandatory: Story = {
    decorators: [
        withFormDecorators({ fieldState: fieldStateFor('sampleField', { mandatory: true }) }),
    ],
    args: { name: 'sampleField', label: 'Required Field' },
};

export const WithWarning: Story = {
    decorators: [
        withFormDecorators({
            fieldState: fieldStateFor('sampleField', { warning: 'Please verify this value' }),
        }),
    ],
    args: { name: 'sampleField', label: 'Field with Warning' },
};

export const WithError: Story = {
    decorators: [
        withFormDecorators({
            fieldState: fieldStateFor('sampleField', { error: 'Invalid value' }),
        }),
    ],
    args: { name: 'sampleField', label: 'Field with Error' },
};

export const Hidden: Story = {
    decorators: [
        withFormDecorators({ fieldState: fieldStateFor('sampleField', { hidden: true }) }),
    ],
    args: { name: 'sampleField', label: 'Hidden Field' },
};
