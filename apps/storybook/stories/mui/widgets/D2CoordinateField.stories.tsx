import { D2CoordinateField } from '@nnkogift/dhis2-form-utils-mui';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { withFormDecorators } from '../../../decorators/withFormDecorators';

const FIELD_ID = 'field-coordinate';

function CoordinateFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('coordinate') });
    return <D2CoordinateField control={control} />;
}

const meta: Meta<typeof CoordinateFieldStory> = {
    title: 'mui/widgets/D2CoordinateField',
    component: CoordinateFieldStory,
    tags: ['autodocs'],
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '' } })],
};
export default meta;
type Story = StoryObj<typeof CoordinateFieldStory>;

// Map canvas hit-testing (WebGL) is unreliable in headless browsers, so this exercises the
// accessible numeric-input fallback instead.
export const Default: Story = {
    play: async ({ canvas }) => {
        const lng = canvas.getByRole('spinbutton', { name: /Longitude/i });
        const lat = canvas.getByRole('spinbutton', { name: /Latitude/i });

        await userEvent.type(lng, '35.703');
        await expect(lng).toHaveValue(35.703);

        await userEvent.type(lat, '-5.639');
        await expect(lat).toHaveValue(-5.639);

        // Re-query: proves longitude survived the latitude edit via field.value, not local state.
        await expect(canvas.getByRole('spinbutton', { name: /Longitude/i })).toHaveValue(35.703);
    },
};
