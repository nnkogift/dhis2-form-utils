import { D2UnsupportedField } from '@nnkogift/dhis2-form-utils-mui';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { withFormDecorators } from '../../../decorators/withFormDecorators';

const FIELD_ID = 'field-unsupported';

function UnsupportedFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('unsupported') });
    return <D2UnsupportedField control={control} />;
}

const meta: Meta<typeof UnsupportedFieldStory> = {
    title: 'mui/Form Fields/D2UnsupportedField',
    component: UnsupportedFieldStory,
    tags: ['autodocs'],
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '' } })],
};
export default meta;
type Story = StoryObj<typeof UnsupportedFieldStory>;

export const Default: Story = {
    play: async ({ canvas }) => {
        await expect(
            canvas.getByText(/Widget not yet implemented: unsupported/i)
        ).toBeInTheDocument();
        await expect(canvas.getByRole('textbox', { name: /unsupported label/i })).toBeDisabled();
    },
};
