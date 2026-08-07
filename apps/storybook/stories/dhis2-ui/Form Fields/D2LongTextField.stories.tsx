import { D2LongTextField } from '@nnkogift/dhis2-form-utils-dhis2-ui';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { fieldStateFor, withFormDecorators } from '../../../decorators/withFormDecorators';

const FIELD_ID = 'field-longText';

function LongTextFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('longText') });
    return <D2LongTextField control={control} />;
}

const meta: Meta<typeof LongTextFieldStory> = {
    title: 'dhis2-ui/Form Fields/D2LongTextField',
    component: LongTextFieldStory,
    tags: ['autodocs'],
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '' } })],
};
export default meta;
type Story = StoryObj<typeof LongTextFieldStory>;

export const Default: Story = {
    play: async ({ canvas }) => {
        const textarea = canvas.getByRole('textbox', { name: /longText label/i });
        await userEvent.type(textarea, 'A longer note about this event.');
        await expect(textarea).toHaveValue('A longer note about this event.');
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
                '[data-test="dhis2-uiwidgets-textareafield-label-required"]'
            )
        ).toBeInTheDocument();
    },
};

export const WithError: Story = {
    decorators: [
        withFormDecorators({
            defaultValues: { [FIELD_ID]: '' },
            fieldState: fieldStateFor(FIELD_ID, { error: 'Invalid value' }),
        }),
    ],
    play: async ({ canvas }) => {
        await expect(canvas.getByText('Invalid value')).toBeInTheDocument();
    },
};
