import { D2OrgUnitField } from '@nnkogift/dhis2-form-utils-dhis2-ui';
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
    title: 'dhis2-ui/widgets/D2OrgUnitField',
    component: OrgUnitFieldStory,
    tags: ['autodocs'],
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '' } })],
};
export default meta;
type Story = StoryObj<typeof OrgUnitFieldStory>;

export const Default: Story = {
    play: async () => {
        // Organisation unit tree is backed by the MSW handlers in .storybook/msw-handlers.ts
        // and does two sequential fetches (root list, then root node data) before rendering.
        const node = await screen.findByText('Bo District', {}, { timeout: 5000 });
        await userEvent.click(node);
        await expect(
            await screen.findByText(/Selected: Bo District/i, {}, { timeout: 5000 })
        ).toBeInTheDocument();
    },
};
