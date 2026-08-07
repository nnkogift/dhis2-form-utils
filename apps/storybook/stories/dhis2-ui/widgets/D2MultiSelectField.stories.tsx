import { D2MultiSelectField } from '@nnkogift/dhis2-form-utils-dhis2-ui';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { withFormDecorators } from '../../../decorators/withFormDecorators';

const FIELD_ID = 'field-multiSelect';

function MultiSelectFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('multiSelect') });
    return <D2MultiSelectField control={control} />;
}

const meta: Meta<typeof MultiSelectFieldStory> = {
    title: 'dhis2-ui/widgets/D2MultiSelectField',
    component: MultiSelectFieldStory,
    tags: ['autodocs'],
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '' } })],
};
export default meta;
type Story = StoryObj<typeof MultiSelectFieldStory>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const field = canvasElement.querySelector('[data-test="dhis2-uiwidgets-multiselectfield"]');
        await expect(field).toBeInTheDocument();
        const trigger = field?.querySelector('[data-test="dhis2-uicore-select-input"]');
        await userEvent.click(trigger as HTMLElement);

        const option = await screen.findByText('Option A');
        await userEvent.click(option);
        await expect(
            canvasElement.querySelector('[data-test="dhis2-uiwidgets-multiselectfield"]')
        ).toBeInTheDocument();
    },
};
