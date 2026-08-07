import { D2ImageField } from '@nnkogift/dhis2-form-utils-mantine';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { withFormDecorators } from '../../../decorators/withFormDecorators';
import { MantineProvider } from '@mantine/core';

const FIELD_ID = 'field-image';

function ImageFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('image') });
    return <D2ImageField control={control} />;
}

const meta: Meta<typeof ImageFieldStory> = {
    title: 'mantine/widgets/D2ImageField',
    component: ImageFieldStory,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <MantineProvider>
                <Story />
            </MantineProvider>
        ),
        withFormDecorators({ defaultValues: { [FIELD_ID]: '' } }),
    ],
};
export default meta;
type Story = StoryObj<typeof ImageFieldStory>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const input = canvasElement.querySelector('input[type="file"]') as HTMLInputElement;
        await expect(input).toBeInTheDocument();
        const file = new File(['fixture'], 'fixture.png', { type: 'image/png' });
        await userEvent.upload(input, file);

        await expect(await screen.findByRole('img')).toHaveAttribute(
            'src',
            expect.stringContaining('fixture-uuid-0000-0000-000000000000')
        );
    },
};
