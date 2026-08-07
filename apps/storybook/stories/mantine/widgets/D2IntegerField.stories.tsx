import { D2IntegerField } from '@nnkogift/dhis2-form-utils-mantine';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { fieldStateFor, withFormDecorators } from '../../../decorators/withFormDecorators';
import { MantineProvider } from '@mantine/core';

const FIELD_ID = 'field-integer';

function IntegerFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('integer') });
    return <D2IntegerField control={control} />;
}

const meta: Meta<typeof IntegerFieldStory> = {
    title: 'mantine/widgets/D2IntegerField',
    component: IntegerFieldStory,
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
type Story = StoryObj<typeof IntegerFieldStory>;

export const Default: Story = {
    play: async ({ canvas }) => {
        const input = canvas.getByLabelText(/integer label/i);
        await userEvent.type(input, '42');
        await expect(input).toHaveValue('42');
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
        await expect(canvas.getByLabelText(/integer label/i)).toBeRequired();
    },
};
