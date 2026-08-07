import { D2SelectField } from '@nnkogift/dhis2-form-utils-mui';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { fieldStateFor, withFormDecorators } from '../../../decorators/withFormDecorators';

const FIELD_ID = 'field-select';

function SelectFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('select') });
    return <D2SelectField control={control} />;
}

const meta: Meta<typeof SelectFieldStory> = {
    title: 'mui/widgets/D2SelectField',
    component: SelectFieldStory,
    tags: ['autodocs'],
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '' } })],
};
export default meta;
type Story = StoryObj<typeof SelectFieldStory>;

export const Default: Story = {
    play: async ({ canvas }) => {
        const combobox = canvas.getByRole('combobox', { name: /select label/i });
        await userEvent.click(combobox);
        await userEvent.click(await screen.findByRole('option', { name: 'Option A' }));
        await expect(canvas.getByText('Option A')).toBeInTheDocument();
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
        await expect(canvas.getByRole('combobox', { name: /select label/i })).toBeInTheDocument();
    },
};
