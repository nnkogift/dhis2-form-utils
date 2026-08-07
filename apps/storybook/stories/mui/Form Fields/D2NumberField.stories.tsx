import { D2NumberField } from '@nnkogift/dhis2-form-utils-mui';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { fieldStateFor, withFormDecorators } from '../../../decorators/withFormDecorators';

const FIELD_ID = 'field-number';

function NumberFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('number') });
    return <D2NumberField control={control} />;
}

const meta: Meta<typeof NumberFieldStory> = {
    title: 'mui/Form Fields/D2NumberField',
    component: NumberFieldStory,
    tags: ['autodocs'],
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '' } })],
};
export default meta;
type Story = StoryObj<typeof NumberFieldStory>;

export const Default: Story = {
    play: async ({ canvas }) => {
        const input = canvas.getByRole('spinbutton', { name: /number label/i });
        await userEvent.type(input, '12.5');
        await expect(input).toHaveValue(12.5);
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
        await expect(canvas.getByRole('spinbutton', { name: /number label/i })).toBeRequired();
    },
};
