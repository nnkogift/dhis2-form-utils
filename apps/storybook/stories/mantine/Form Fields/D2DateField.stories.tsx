import { D2DateField } from '@nnkogift/dhis2-form-utils-mantine';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { fieldStateFor, withFormDecorators } from '../../../decorators/withFormDecorators';
import { MantineProvider } from '@mantine/core';

const FIELD_ID = 'field-date';

function DateFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('date') });
    return <D2DateField control={control} />;
}

const meta: Meta<typeof DateFieldStory> = {
    title: 'mantine/Form Fields/D2DateField',
    component: DateFieldStory,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <MantineProvider>
                <Story />
            </MantineProvider>
        ),
        withFormDecorators({ defaultValues: { [FIELD_ID]: '' } }),
    ],
};
export default meta;
type Story = StoryObj<typeof DateFieldStory>;

export const Default: Story = {
    play: async ({ canvas }) => {
        const input = canvas.getByLabelText(/date label/i);
        await userEvent.type(input, '2024-06-15');
        await expect(input).toHaveValue('2024-06-15');
    },
};

export const Mandatory: Story = {
    decorators: [
        withFormDecorators({
            defaultValues: { [FIELD_ID]: '' },
            fieldState: fieldStateFor(FIELD_ID, { mandatory: true }),
        }),
    ],
    play: async ({ canvas }) => {
        await expect(canvas.getByLabelText(/date label/i)).toBeRequired();
    },
};
