import { D2BooleanField } from '@nnkogift/dhis2-form-utils-dhis2-ui';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { fieldStateFor, withFormDecorators } from '../../../decorators/withFormDecorators';

const FIELD_ID = 'field-boolean';

function BooleanFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('boolean') });
    return <D2BooleanField control={control} />;
}

const meta: Meta<typeof BooleanFieldStory> = {
    title: 'dhis2-ui/widgets/D2BooleanField',
    component: BooleanFieldStory,
    tags: ['autodocs'],
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '' } })],
};
export default meta;
type Story = StoryObj<typeof BooleanFieldStory>;

// Regression coverage for the ChoiceFields.tsx refactor: the radio group is now wrapped in
// dhis2-ui's <Field>, and the old "—" unset option was dropped in favor of just Yes/No.
export const Default: Story = {
    play: async ({ canvas }) => {
        // Regression coverage: the <Field> refactor needs an explicit `label` prop, otherwise
        // the field renders with no visible label at all.
        await expect(canvas.getByText(/boolean label/i)).toBeInTheDocument();

        const yes = canvas.getByRole('radio', { name: 'Yes' });
        const no = canvas.getByRole('radio', { name: 'No' });
        await expect(yes).not.toBeChecked();
        await expect(no).not.toBeChecked();
        await expect(canvas.queryByRole('radio', { name: '—' })).not.toBeInTheDocument();

        await userEvent.click(yes);
        await expect(yes).toBeChecked();

        await userEvent.click(no);
        await expect(no).toBeChecked();
        await expect(yes).not.toBeChecked();
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
        // Confirms <Field required={isMandatory}> still surfaces the required indicator
        // after the fieldset/legend -> <Field> refactor.
        await expect(
            canvasElement.querySelector('[data-test="dhis2-uicore-field-label-required"]')
        ).toBeInTheDocument();
    },
};

export const WithWarning: Story = {
    decorators: [
        withFormDecorators({
            defaultValues: { [FIELD_ID]: '' },
            fieldState: fieldStateFor(FIELD_ID, { warning: 'Please confirm this value' }),
        }),
    ],
    play: async ({ canvas }) => {
        await expect(canvas.getByText('Please confirm this value')).toBeInTheDocument();
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

export const Disabled: Story = {
    decorators: [
        withFormDecorators({
            defaultValues: { [FIELD_ID]: 'true' },
            fieldState: fieldStateFor(FIELD_ID, { assignedValue: 'true' }),
        }),
    ],
    play: async ({ canvas }) => {
        await expect(canvas.getByRole('radio', { name: 'Yes' })).toBeDisabled();
        await expect(canvas.getByRole('radio', { name: 'No' })).toBeDisabled();
    },
};
