import { D2DateTimeField } from '@nnkogift/dhis2-form-utils-dhis2-ui';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { withFormDecorators } from '../../../decorators/withFormDecorators';

const FIELD_ID = 'field-datetime';

function DateTimeFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('datetime') });
    return <D2DateTimeField control={control} />;
}

const meta: Meta<typeof DateTimeFieldStory> = {
    title: 'dhis2-ui/Form Fields/D2DateTimeField',
    component: DateTimeFieldStory,
    tags: ['autodocs'],
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '' } })],
};
export default meta;
type Story = StoryObj<typeof DateTimeFieldStory>;

// D2DateTimeField renders a CalendarInput (date) and an InputField[type=time] side by side.
// The two are exercised in separate stories rather than one play function: typing into the
// date input's text field can pop open the calendar overlay, which steals focus from a
// subsequently-typed time input in the same headless run.
export const Default: Story = {
    play: async ({ canvasElement }) => {
        const dateInput = canvasElement.querySelector('input[type="text"]') as HTMLInputElement;
        const timeInput = canvasElement.querySelector('input[type="time"]') as HTMLInputElement;
        await expect(dateInput).toBeInTheDocument();
        await expect(timeInput).toBeInTheDocument();
    },
};

export const SetsDate: Story = {
    play: async ({ canvasElement }) => {
        const dateInput = canvasElement.querySelector('input[type="text"]') as HTMLInputElement;
        await userEvent.clear(dateInput);
        await userEvent.type(dateInput, '2024-06-15');
        await expect(dateInput).toHaveValue('2024-06-15');
    },
};

export const SetsTime: Story = {
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '2024-06-15T00:00' } })],
    play: async ({ canvasElement }) => {
        const timeInput = canvasElement.querySelector('input[type="time"]') as HTMLInputElement;
        // userEvent.type() drives type="time" inputs through segmented keyboard input, which is
        // unreliable in headless runs when a second (date) input shares the page. fireEvent.change
        // exercises the same onChange -> field.onChange -> value round trip more deterministically.
        await fireEvent.change(timeInput, { target: { value: '14:30' } });
        await expect(timeInput).toHaveValue('14:30');
    },
};
