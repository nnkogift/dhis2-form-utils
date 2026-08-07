import { D2TimeField } from '@nnkogift/dhis2-form-utils-dhis2-ui';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { fieldStateFor, withFormDecorators } from '../../../decorators/withFormDecorators';

const FIELD_ID = 'field-time';

function TimeFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('time') });
    return <D2TimeField control={control} />;
}

const meta: Meta<typeof TimeFieldStory> = {
    title: 'dhis2-ui/Form Fields/D2TimeField',
    component: TimeFieldStory,
    tags: ['autodocs'],
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '' } })],
};
export default meta;
type Story = StoryObj<typeof TimeFieldStory>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const input = canvasElement.querySelector('input[type="time"]') as HTMLInputElement;
        await expect(input).toBeInTheDocument();
        await userEvent.clear(input);
        await userEvent.type(input, '14:30');
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
        await expect(
            canvasElement.querySelector('[data-test="dhis2-uiwidgets-inputfield-label-required"]')
        ).toBeInTheDocument();
    },
};
