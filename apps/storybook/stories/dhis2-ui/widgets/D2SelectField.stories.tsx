import { D2SelectField } from '@nnkogift/dhis2-form-utils-dhis2-ui';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { fieldStateFor, withFormDecorators } from '../../../decorators/withFormDecorators';

const FIELD_ID = 'field-select';

function SelectFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('select') });
    return <D2SelectField control={control} />;
}

const meta: Meta<typeof SelectFieldStory> = {
    title: 'dhis2-ui/widgets/D2SelectField',
    component: SelectFieldStory,
    tags: ['autodocs'],
    decorators: [withFormDecorators({ defaultValues: { [FIELD_ID]: '' } })],
};
export default meta;
type Story = StoryObj<typeof SelectFieldStory>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const field = canvasElement.querySelector(
            '[data-test="dhis2-uiwidgets-singleselectfield"]'
        );
        await expect(field).toBeInTheDocument();
        const trigger = field?.querySelector('[data-test="dhis2-uicore-select-input"]');
        await expect(trigger).toBeInTheDocument();

        await userEvent.click(trigger as HTMLElement);
        await userEvent.click(await screen.findByText('Option A'));
        await expect(screen.getByText('Option A')).toBeInTheDocument();
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
        await expect(
            canvasElement.querySelector(
                '[data-test="dhis2-uiwidgets-singleselectfield-label-required"]'
            )
        ).toBeInTheDocument();
    },
};
