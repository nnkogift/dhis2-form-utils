import { D2OrgUnitField } from '@nnkogift/dhis2-form-utils-mui';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { withFormDecorators } from '../../../decorators/withFormDecorators';

const FIELD_ID = 'field-orgUnit';

function OrgUnitFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('orgUnit') });
    return <D2OrgUnitField control={control} />;
}

const meta: Meta<typeof OrgUnitFieldStory> = {
    title: 'mui/widgets/D2OrgUnitField',
    component: OrgUnitFieldStory,
    tags: ['autodocs'],
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '' } })],
};
export default meta;
type Story = StoryObj<typeof OrgUnitFieldStory>;

// v1 scope: MUI has no org-unit tree primitive, so this renders a flat searchable Autocomplete
// over org units fetched via the MSW handlers in .storybook/msw-handlers.ts.
export const Default: Story = {
    play: async ({ canvas }) => {
        const input = canvas.getByRole('combobox', { name: /orgUnit label/i });
        await userEvent.click(input);
        const option = await screen.findByText(/Bo District/i, {}, { timeout: 5000 });
        await userEvent.click(option);
        // MUI's flat Autocomplete shows the ancestor path alongside the org unit name.
        await expect(input).toHaveValue('Bo District (Sierra Leone)');
    },
};
