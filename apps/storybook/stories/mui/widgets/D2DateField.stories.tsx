import { D2DateField } from '@nnkogift/dhis2-form-utils-mui';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { fieldStateFor, withFormDecorators } from '../../../decorators/withFormDecorators';

const FIELD_ID = 'field-date';

function DateFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('date') });
    return <D2DateField control={control} />;
}

const meta: Meta<typeof DateFieldStory> = {
    title: 'mui/widgets/D2DateField',
    component: DateFieldStory,
    tags: ['autodocs'],
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '' } })],
};
export default meta;
type Story = StoryObj<typeof DateFieldStory>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        // MUI X DatePicker renders a segmented field over a single hidden text input.
        // fireEvent.change exercises the onChange -> field.onChange round trip deterministically,
        // avoiding userEvent's fragile per-segment keyboard typing in headless runs.
        const input = canvasElement.querySelector('input') as HTMLInputElement;
        await expect(input).toBeInTheDocument();
        await fireEvent.change(input, { target: { value: '2024-06-15' } });
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
        const input = canvasElement.querySelector('input') as HTMLInputElement;
        await expect(input).toBeRequired();
    },
};
