import { D2PercentageField } from '@nnkogift/dhis2-form-utils-mantine';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { withFormDecorators } from '../../../decorators/withFormDecorators';
import { MantineProvider } from '@mantine/core';

const FIELD_ID = 'field-percentage';

function PercentageFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('percentage') });
    return <D2PercentageField control={control} />;
}

const meta: Meta<typeof PercentageFieldStory> = {
    title: 'mantine/widgets/D2PercentageField',
    component: PercentageFieldStory,
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
type Story = StoryObj<typeof PercentageFieldStory>;

export const Default: Story = {
    play: async ({ canvas }) => {
        const input = canvas.getByLabelText(/percentage label/i);
        await userEvent.type(input, '75');
        await expect(input).toHaveValue('75%');
    },
};
