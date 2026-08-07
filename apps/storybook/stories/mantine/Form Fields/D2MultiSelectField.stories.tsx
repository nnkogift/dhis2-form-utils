import { D2MultiSelectField } from '@nnkogift/dhis2-form-utils-mantine';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { withFormDecorators } from '../../../decorators/withFormDecorators';
import { MantineProvider } from '@mantine/core';

const FIELD_ID = 'field-multiSelect';

function MultiSelectFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('multiSelect') });
    return <D2MultiSelectField control={control} />;
}

const meta: Meta<typeof MultiSelectFieldStory> = {
    title: 'mantine/Form Fields/D2MultiSelectField',
    component: MultiSelectFieldStory,
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
type Story = StoryObj<typeof MultiSelectFieldStory>;

export const Default: Story = {
    play: async ({ canvas }) => {
        const input = canvas.getByRole('textbox', { name: /multiSelect label/i });
        const target = input.closest('.mantine-MultiSelect-input') ?? input.parentElement ?? input;
        await userEvent.click(target);
        await expect(await screen.findByRole('option', { name: 'Option A' })).toBeInTheDocument();
        await userEvent.click(screen.getByRole('option', { name: 'Option A' }));
        await expect(canvas.getByText('Option A')).toBeInTheDocument();
    },
};
