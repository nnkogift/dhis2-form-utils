import { D2EmailField } from '@nnkogift/dhis2-form-utils-dhis2-ui';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { fieldStateFor, withFormDecorators } from '../../../decorators/withFormDecorators';

const FIELD_ID = 'field-email';

function EmailFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('email') });
    return <D2EmailField control={control} />;
}

const meta: Meta<typeof EmailFieldStory> = {
    title: 'dhis2-ui/widgets/D2EmailField',
    component: EmailFieldStory,
    tags: ['autodocs'],
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '' } })],
};
export default meta;
type Story = StoryObj<typeof EmailFieldStory>;

export const Default: Story = {
    play: async ({ canvas, canvasElement }) => {
        const input = canvasElement.querySelector('input[type="email"]') as HTMLInputElement;
        await expect(input).toBeInTheDocument();
        await userEvent.type(input, 'user@example.org');
        await expect(input).toHaveValue('user@example.org');
        await expect(canvas.getByText(/email label/i)).toBeInTheDocument();
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

export const WithError: Story = {
    decorators: [
        withFormDecorators({
            defaultValues: { [FIELD_ID]: '' },
            fieldState: fieldStateFor(FIELD_ID, { error: 'Invalid email address' }),
        }),
    ],
    play: async ({ canvas }) => {
        await expect(canvas.getByText('Invalid email address')).toBeInTheDocument();
    },
};
