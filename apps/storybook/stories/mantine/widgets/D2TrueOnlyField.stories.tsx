import { D2TrueOnlyField } from '@nnkogift/dhis2-form-utils-mantine';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { fieldStateFor, withFormDecorators } from '../../../decorators/withFormDecorators';
import { MantineProvider } from '@mantine/core';

const FIELD_ID = 'field-trueOnly';

function TrueOnlyFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('trueOnly') });
    return <D2TrueOnlyField control={control} />;
}

const meta: Meta<typeof TrueOnlyFieldStory> = {
    title: 'mantine/widgets/D2TrueOnlyField',
    component: TrueOnlyFieldStory,
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
type Story = StoryObj<typeof TrueOnlyFieldStory>;

export const Default: Story = {
    play: async ({ canvas }) => {
        const checkbox = canvas.getByRole('checkbox', { name: /trueOnly label/i });
        await expect(checkbox).not.toBeChecked();
        await userEvent.click(checkbox);
        await expect(checkbox).toBeChecked();
        await userEvent.click(checkbox);
        await expect(checkbox).not.toBeChecked();
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
        await expect(canvas.getByRole('checkbox', { name: /trueOnly label/i })).toBeRequired();
    },
};
