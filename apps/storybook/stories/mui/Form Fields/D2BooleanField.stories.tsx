import { D2BooleanField } from '@nnkogift/dhis2-form-utils-mui';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { fieldStateFor, withFormDecorators } from '../../../decorators/withFormDecorators';

const FIELD_ID = 'field-boolean';

function BooleanFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('boolean') });
    return <D2BooleanField control={control} />;
}

const meta: Meta<typeof BooleanFieldStory> = {
    title: 'mui/Form Fields/D2BooleanField',
    component: BooleanFieldStory,
    tags: ['autodocs'],
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '' } })],
};
export default meta;
type Story = StoryObj<typeof BooleanFieldStory>;

export const Default: Story = {
    play: async ({ canvas }) => {
        const yes = canvas.getByRole('radio', { name: 'Yes' });
        const no = canvas.getByRole('radio', { name: 'No' });
        // Non-mandatory: D2BooleanField still offers a "—" unset option in this adapter.
        await expect(canvas.getByRole('radio', { name: '—' })).toBeInTheDocument();

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
    play: async ({ canvas }) => {
        await expect(canvas.queryByRole('radio', { name: '—' })).not.toBeInTheDocument();
        await expect(canvas.getByText('boolean label')).toBeInTheDocument();
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
