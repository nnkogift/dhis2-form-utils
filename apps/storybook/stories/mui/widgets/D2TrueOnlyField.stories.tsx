import { D2TrueOnlyField } from '@nnkogift/dhis2-form-utils-mui';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { withFormDecorators } from '../../../decorators/withFormDecorators';

const FIELD_ID = 'field-trueOnly';

function TrueOnlyFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('trueOnly') });
    return <D2TrueOnlyField control={control} />;
}

const meta: Meta<typeof TrueOnlyFieldStory> = {
    title: 'mui/widgets/D2TrueOnlyField',
    component: TrueOnlyFieldStory,
    tags: ['autodocs'],
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '' } })],
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
