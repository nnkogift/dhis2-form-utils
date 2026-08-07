import { D2DateTimeField } from '@nnkogift/dhis2-form-utils-mui';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { withFormDecorators } from '../../../decorators/withFormDecorators';

const FIELD_ID = 'field-datetime';

function DateTimeFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('datetime') });
    return <D2DateTimeField control={control} />;
}

const meta: Meta<typeof DateTimeFieldStory> = {
    title: 'mui/Form Fields/D2DateTimeField',
    component: DateTimeFieldStory,
    tags: ['autodocs'],
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '2024-06-15T14:30' } })],
};
export default meta;
type Story = StoryObj<typeof DateTimeFieldStory>;

// MUI X DateTimePicker's controlled-value round trip through its segmented field is not reliably
// observable in a headless run, so — matching the D2DateField/D2TimeField precedent for this
// adapter — this only asserts the field renders with the parsed default value present.
export const Default: Story = {
    play: async ({ canvasElement }) => {
        const input = canvasElement.querySelector('input') as HTMLInputElement;
        await expect(input).toBeInTheDocument();
        await expect(input.value).not.toBe('');
    },
};
