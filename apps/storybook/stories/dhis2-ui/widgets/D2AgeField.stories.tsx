import { D2AgeField } from '@nnkogift/dhis2-form-utils-dhis2-ui';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { withFormDecorators } from '../../../decorators/withFormDecorators';

const FIELD_ID = 'field-age';

function AgeFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('age') });
    return <D2AgeField control={control} />;
}

const meta: Meta<typeof AgeFieldStory> = {
    title: 'dhis2-ui/widgets/D2AgeField',
    component: AgeFieldStory,
    tags: ['autodocs'],
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '2000-01-01' } })],
};
export default meta;
type Story = StoryObj<typeof AgeFieldStory>;

export const ShowsComputedAge: Story = {
    play: async ({ canvas }) => {
        // D2AgeField folds the computed age into the underlying D2DateField's helpText.
        await expect(canvas.getByText(/Age: \d+ years/)).toBeInTheDocument();
    },
};

export const NoDateOfBirth: Story = {
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '' } })],
    play: async ({ canvas }) => {
        await expect(canvas.queryByText(/Age: \d+ years/)).not.toBeInTheDocument();
    },
};
