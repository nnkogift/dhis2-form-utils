import { D2DateTimeField } from '@nnkogift/dhis2-form-utils-mantine';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { withFormDecorators } from '../../../decorators/withFormDecorators';
import { MantineProvider } from '@mantine/core';

const FIELD_ID = 'field-datetime';

function DateTimeFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('datetime') });
    return <D2DateTimeField control={control} />;
}

const meta: Meta<typeof DateTimeFieldStory> = {
    title: 'mantine/Form Fields/D2DateTimeField',
    component: DateTimeFieldStory,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <MantineProvider>
                <Story />
            </MantineProvider>
        ),
        withFormDecorators({ defaultValues: { [FIELD_ID]: '2024-06-15T14:30' } }),
    ],
};
export default meta;
type Story = StoryObj<typeof DateTimeFieldStory>;

// DateTimePicker's controlled-value -> formatted-display round trip is not reliably observable
// in a headless run (its dropdown/calendar interaction is stateful and async), so — matching the
// precedent in D2Field.stories.tsx's DateTime story — this only asserts the field renders.
export const Default: Story = {
    play: async ({ canvas }) => {
        await expect(canvas.getByLabelText(/datetime label/i)).toBeInTheDocument();
    },
};
