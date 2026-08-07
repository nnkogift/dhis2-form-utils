import { D2MultiSelectField } from '@nnkogift/dhis2-form-utils-mui';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { withFormDecorators } from '../../../decorators/withFormDecorators';

const FIELD_ID = 'field-multiSelect';

function MultiSelectFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('multiSelect') });
    return <D2MultiSelectField control={control} />;
}

const meta: Meta<typeof MultiSelectFieldStory> = {
    title: 'mui/widgets/D2MultiSelectField',
    component: MultiSelectFieldStory,
    tags: ['autodocs'],
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '' } })],
};
export default meta;
type Story = StoryObj<typeof MultiSelectFieldStory>;

export const Default: Story = {
    play: async ({ canvas }) => {
        const combobox = canvas.getByRole('combobox', { name: /multiSelect label/i });
        await userEvent.click(combobox);
        await userEvent.click(await screen.findByRole('option', { name: 'Option A' }));
        await expect(canvas.getByText('Option A')).toBeInTheDocument();
    },
};
