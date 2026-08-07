import { D2DateField } from '@nnkogift/dhis2-form-utils-dhis2-ui';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { fieldStateFor, withFormDecorators } from '../../../decorators/withFormDecorators';

const FIELD_ID = 'field-date';

function DateFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('date') });
    return <D2DateField control={control} />;
}

const meta: Meta<typeof DateFieldStory> = {
    title: 'dhis2-ui/widgets/D2DateField',
    component: DateFieldStory,
    tags: ['autodocs'],
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '' } })],
};
export default meta;
type Story = StoryObj<typeof DateFieldStory>;

export const Default: Story = {
    play: async ({ canvas, canvasElement }) => {
        // CalendarInput renders a text input carrying the ISO date, labeled by the field label.
        const input =
            canvas.queryByLabelText(/date label/i) ??
            canvasElement.querySelector('input[type="text"]');
        await expect(input).toBeInTheDocument();
        await userEvent.clear(input);
        await userEvent.type(input, '2024-06-15');
        await expect(input).toHaveValue('2024-06-15');
    },
};

export const Mandatory: Story = {
    decorators: [
        withFormDecorators({
            defaultValues: { [FIELD_ID]: '' },
            fieldState: fieldStateFor(FIELD_ID, { mandatory: true }),
        }),
    ],
    play: async ({ canvasElement }) => {
        await expect(
            canvasElement.querySelector(
                '[data-test="dhis2-uiwidgets-calendar-inputfield-label-required"]'
            )
        ).toBeInTheDocument();
    },
};
