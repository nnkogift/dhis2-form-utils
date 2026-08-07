import { D2BooleanField } from '@nnkogift/dhis2-form-utils-mantine';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { fieldStateFor, withFormDecorators } from '../../../decorators/withFormDecorators';
import { MantineProvider } from '@mantine/core';

const FIELD_ID = 'field-boolean';

function BooleanFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('boolean') });
    return <D2BooleanField control={control} />;
}

const meta: Meta<typeof BooleanFieldStory> = {
    title: 'mantine/widgets/D2BooleanField',
    component: BooleanFieldStory,
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
type Story = StoryObj<typeof BooleanFieldStory>;

export const Default: Story = {
    play: async ({ canvas }) => {
        const group = canvas.getByRole('radiogroup', { name: /boolean label/i });
        const yes = within(group).getByRole('radio', { name: 'Yes' });
        const no = within(group).getByRole('radio', { name: 'No' });
        await expect(yes).not.toBeChecked();

        await userEvent.click(yes);
        await expect(yes).toBeChecked();

        await userEvent.click(no);
        await expect(no).toBeChecked();
        await expect(yes).not.toBeChecked();
    },
};

export const Mandatory: Story = {
    decorators: [
        withFormDecorators({
            defaultValues: { [FIELD_ID]: '' },
            fieldState: fieldStateFor(FIELD_ID, { mandatory: true }),
        }),
    ],
    play: async ({ canvas, canvasElement }) => {
        // The "*" required indicator is aria-hidden, so it isn't part of the group's accessible
        // name — assert the underlying data-required attribute instead.
        await expect(
            canvas.getByRole('radiogroup', { name: /boolean label/i })
        ).toBeInTheDocument();
        await expect(
            canvasElement.querySelector('.mantine-RadioGroup-label[data-required="true"]')
        ).toBeInTheDocument();
    },
};

export const WithError: Story = {
    decorators: [
        withFormDecorators({
            defaultValues: { [FIELD_ID]: '' },
            fieldState: fieldStateFor(FIELD_ID, { error: 'Invalid value' }),
        }),
    ],
    play: async ({ canvas }) => {
        await expect(canvas.getByText('Invalid value')).toBeInTheDocument();
    },
};
