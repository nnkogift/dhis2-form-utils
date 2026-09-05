import { D2CoordinateField } from '@nnkogift/dhis2-form-utils-mui';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitForElementToBeRemoved } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { withFormDecorators } from '../../../decorators/withFormDecorators';

const FIELD_ID = 'field-coordinate';

function CoordinateFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('coordinate') });
    return <D2CoordinateField control={control} />;
}

const meta: Meta<typeof CoordinateFieldStory> = {
    title: 'mui/Form Fields/D2CoordinateField',
    component: CoordinateFieldStory,
    tags: ['autodocs'],
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '' } })],
};
export default meta;
type Story = StoryObj<typeof CoordinateFieldStory>;

// Map canvas hit-testing (WebGL) is unreliable in headless browsers, so this exercises the
// accessible numeric-input fallback instead. MUI's Dialog renders in a portal outside the story
// root, so anything inside it is queried via the global `screen`, not the story-scoped `canvas`.
export const Default: Story = {
    play: async ({ canvas }) => {
        await expect(canvas.getByText('No location set')).toBeInTheDocument();
        await userEvent.click(canvas.getByRole('button', { name: /Set location/i }));

        const lng = await screen.findByRole('spinbutton', { name: /Longitude/i });
        const lat = screen.getByRole('spinbutton', { name: /Latitude/i });

        await userEvent.type(lng, '35.703');
        await expect(lng).toHaveValue(35.703);

        await userEvent.type(lat, '-5.639');
        await expect(lat).toHaveValue(-5.639);

        // Re-query: proves longitude survived the latitude edit via draft state, not local text.
        await expect(screen.getByRole('spinbutton', { name: /Longitude/i })).toHaveValue(35.703);

        await userEvent.click(screen.getByRole('button', { name: /Update location/i }));

        // MUI's Dialog unmounts its content asynchronously, after the exit transition. The
        // closed-state summary labels each axis (Lat/Lng) rather than showing a bare number pair.
        await waitForElementToBeRemoved(() =>
            screen.queryByRole('spinbutton', { name: /Longitude/i })
        );
        await expect(canvas.getByText('Lat')).toBeInTheDocument();
        await expect(canvas.getByText('-5.63900')).toBeInTheDocument();
        await expect(canvas.getByText('Lng')).toBeInTheDocument();
        await expect(canvas.getByText('35.70300')).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: /Change location/i })).toBeInTheDocument();
    },
};

// Cancel must discard the draft — no field.onChange is fired, so the closed-state summary must
// stay exactly as it was before the modal opened.
export const Cancel: Story = {
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole('button', { name: /Set location/i }));

        const lng = await screen.findByRole('spinbutton', { name: /Longitude/i });
        await userEvent.type(lng, '35.703');

        await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));

        await waitForElementToBeRemoved(() =>
            screen.queryByRole('spinbutton', { name: /Longitude/i })
        );
        await expect(canvas.getByText('No location set')).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: /Set location/i })).toBeInTheDocument();
    },
};
