import { D2FileField } from '@nnkogift/dhis2-form-utils-mui';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { withFormDecorators } from '../../../decorators/withFormDecorators';

const FIELD_ID = 'field-file';

function FileFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('file') });
    return <D2FileField control={control} />;
}

const meta: Meta<typeof FileFieldStory> = {
    title: 'mui/Form Fields/D2FileField',
    component: FileFieldStory,
    tags: ['autodocs'],
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '' } })],
};
export default meta;
type Story = StoryObj<typeof FileFieldStory>;

export const Default: Story = {
    play: async ({ canvas, canvasElement }) => {
        await expect(canvas.getByRole('button', { name: /Select file/i })).toBeInTheDocument();
        const input = canvasElement.querySelector('input[type="file"]') as HTMLInputElement;
        await expect(input).toBeInTheDocument();
        const file = new File(['fixture'], 'fixture.png', { type: 'image/png' });
        await userEvent.upload(input, file);
        await expect(canvas.queryByText(/Upload failed/i)).not.toBeInTheDocument();
    },
};
