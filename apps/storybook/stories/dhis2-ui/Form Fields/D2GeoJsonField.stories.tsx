import { D2GeoJsonField } from '@nnkogift/dhis2-form-utils-dhis2-ui';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { withFormDecorators } from '../../../decorators/withFormDecorators';

const FIELD_ID = 'field-geojson';

function GeoJsonFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('geojson') });
    return <D2GeoJsonField control={control} />;
}

const meta: Meta<typeof GeoJsonFieldStory> = {
    title: 'dhis2-ui/Form Fields/D2GeoJsonField',
    component: GeoJsonFieldStory,
    tags: ['autodocs'],
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '' } })],
};
export default meta;
type Story = StoryObj<typeof GeoJsonFieldStory>;

export const Default: Story = {
    play: async ({ canvas }) => {
        const textarea = canvas.getByRole('textbox', { name: /Geometry \(JSON\)/i });
        await userEvent.clear(textarea);
        // userEvent.type() parses `{`/`}` as its keyboard DSL (e.g. "{enter}"), so paste instead.
        await userEvent.click(textarea);
        await userEvent.paste('{"type":"Point","coordinates":[10.9,59.8]}');
        await userEvent.tab();
        await expect(canvas.queryByText(/Not a valid GeoJSON geometry/i)).not.toBeInTheDocument();
    },
};

export const InvalidGeometry: Story = {
    play: async ({ canvas }) => {
        const textarea = canvas.getByRole('textbox', { name: /Geometry \(JSON\)/i });
        await userEvent.clear(textarea);
        await userEvent.click(textarea);
        await userEvent.paste('not json');
        await userEvent.tab();
        await expect(canvas.getByText(/Not a valid GeoJSON geometry/i)).toBeInTheDocument();
    },
};
