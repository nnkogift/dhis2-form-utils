import { D2EmailField } from '@nnkogift/dhis2-form-utils-mui';
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
    title: 'mui/widgets/D2EmailField',
    component: EmailFieldStory,
    tags: ['autodocs'],
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '' } })],
};
export default meta;
type Story = StoryObj<typeof EmailFieldStory>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const input = canvasElement.querySelector('input[type="email"]') as HTMLInputElement;
        await expect(input).toBeInTheDocument();
        await userEvent.type(input, 'user@example.org');
        await expect(input).toHaveValue('user@example.org');
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
        const input = canvasElement.querySelector('input[type="email"]') as HTMLInputElement;
        await expect(input).toBeRequired();
    },
};
