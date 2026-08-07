import { D2TextField } from '@nnkogift/dhis2-form-utils-mui';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { fieldStateFor, withFormDecorators } from '../../../decorators/withFormDecorators';

const FIELD_ID = 'field-text';

function TextFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('text') });
    return <D2TextField control={control} />;
}

const meta: Meta<typeof TextFieldStory> = {
    title: 'mui/Form Fields/D2TextField',
    component: TextFieldStory,
    tags: ['autodocs'],
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '' } })],
};
export default meta;
type Story = StoryObj<typeof TextFieldStory>;

export const Default: Story = {
    play: async ({ canvas }) => {
        const input = canvas.getByRole('textbox', { name: /text label/i });
        await userEvent.type(input, 'Hello DHIS2');
        await expect(input).toHaveValue('Hello DHIS2');
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
        await expect(canvas.getByRole('textbox', { name: /text label/i })).toBeRequired();
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
