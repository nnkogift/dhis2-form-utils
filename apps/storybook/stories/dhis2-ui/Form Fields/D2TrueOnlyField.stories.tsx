import { D2TrueOnlyField } from '@nnkogift/dhis2-form-utils-dhis2-ui';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { fieldStateFor, withFormDecorators } from '../../../decorators/withFormDecorators';

const FIELD_ID = 'field-trueOnly';

function TrueOnlyFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('trueOnly') });
    return <D2TrueOnlyField control={control} />;
}

const meta: Meta<typeof TrueOnlyFieldStory> = {
    title: 'dhis2-ui/Form Fields/D2TrueOnlyField',
    component: TrueOnlyFieldStory,
    tags: ['autodocs'],
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '' } })],
};
export default meta;
type Story = StoryObj<typeof TrueOnlyFieldStory>;

export const Default: Story = {
    play: async ({ canvas }) => {
        const checkbox = canvas.getByRole('checkbox', { name: /trueOnly label/i });
        await expect(checkbox).not.toBeChecked();
        await userEvent.click(checkbox);
        await expect(checkbox).toBeChecked();
        // Unchecking a TRUE_ONLY field clears the value rather than storing "false".
        await userEvent.click(checkbox);
        await expect(checkbox).not.toBeChecked();
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
            canvasElement.querySelector('[data-test="dhis2-uiwidgets-checkboxfield-required"]')
        ).toBeInTheDocument();
    },
};
