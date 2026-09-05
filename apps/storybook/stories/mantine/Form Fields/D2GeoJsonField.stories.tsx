import { D2GeoJsonField } from '@nnkogift/dhis2-form-utils-mantine';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitForElementToBeRemoved } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { withFormDecorators } from '../../../decorators/withFormDecorators';
import { MantineProvider } from '@mantine/core';

const FIELD_ID = 'field-geojson';

function GeoJsonFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('geojson') });
    return <D2GeoJsonField control={control} />;
}

const meta: Meta<typeof GeoJsonFieldStory> = {
    title: 'mantine/Form Fields/D2GeoJsonField',
    component: GeoJsonFieldStory,
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
type Story = StoryObj<typeof GeoJsonFieldStory>;

// Mantine's Modal renders in a portal outside the story root, so anything inside it is queried
// via the global `screen`, not the story-scoped `canvas`.
export const Default: Story = {
    play: async ({ canvas }) => {
        await expect(canvas.getByText('No geometry set')).toBeInTheDocument();
        await userEvent.click(canvas.getByRole('button', { name: /Set geometry/i }));

        const textarea = await screen.findByLabelText(/Geometry \(JSON\)/i);
        await userEvent.click(textarea);
        await userEvent.paste('{"type":"Point","coordinates":[10.9,59.8]}');
        await userEvent.tab();
        await expect(screen.queryByText(/Not a valid GeoJSON geometry/i)).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: /Update geometry/i }));

        // Mantine's Modal unmounts its content asynchronously, after the exit transition.
        await waitForElementToBeRemoved(() => screen.queryByLabelText(/Geometry \(JSON\)/i));
        await expect(canvas.getByText('Point')).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: /Edit geometry/i })).toBeInTheDocument();
    },
};

export const InvalidGeometry: Story = {
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole('button', { name: /Set geometry/i }));

        const textarea = await screen.findByLabelText(/Geometry \(JSON\)/i);
        await userEvent.click(textarea);
        await userEvent.paste('not json');
        await userEvent.tab();
        await expect(screen.getByText(/Not a valid GeoJSON geometry/i)).toBeInTheDocument();
        await expect(screen.getByRole('button', { name: /Update geometry/i })).toBeDisabled();
    },
};

// Cancel must discard the draft — no field.onChange is fired, so the closed-state summary must
// stay exactly as it was before the modal opened.
export const Cancel: Story = {
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole('button', { name: /Set geometry/i }));

        const textarea = await screen.findByLabelText(/Geometry \(JSON\)/i);
        await userEvent.click(textarea);
        await userEvent.paste('{"type":"Point","coordinates":[10.9,59.8]}');
        await userEvent.tab();

        await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));

        await waitForElementToBeRemoved(() => screen.queryByLabelText(/Geometry \(JSON\)/i));
        await expect(canvas.getByText('No geometry set')).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: /Set geometry/i })).toBeInTheDocument();
    },
};
