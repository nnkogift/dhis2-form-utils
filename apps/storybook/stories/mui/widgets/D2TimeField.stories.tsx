import { D2TimeField } from '@nnkogift/dhis2-form-utils-mui';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { fieldStateFor, withFormDecorators } from '../../../decorators/withFormDecorators';

const FIELD_ID = 'field-time';

function TimeFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('time') });
    return <D2TimeField control={control} />;
}

const meta: Meta<typeof TimeFieldStory> = {
    title: 'mui/widgets/D2TimeField',
    component: TimeFieldStory,
    tags: ['autodocs'],
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '' } })],
};
export default meta;
type Story = StoryObj<typeof TimeFieldStory>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const input = canvasElement.querySelector('input') as HTMLInputElement;
        await expect(input).toBeInTheDocument();
        await fireEvent.change(input, { target: { value: '14:30' } });
        await expect(input).toHaveValue('14:30');
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
