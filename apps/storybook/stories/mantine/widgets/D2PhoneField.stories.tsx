import { D2PhoneField } from '@nnkogift/dhis2-form-utils-mantine';
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { makeFieldPsde } from '../../../fixtures/fieldMetadata';
import { fieldStateFor, withFormDecorators } from '../../../decorators/withFormDecorators';
import { MantineProvider } from '@mantine/core';

const FIELD_ID = 'field-phone';

function PhoneFieldStory() {
    const control = useFieldControl({ kind: 'dataElement', config: makeFieldPsde('phone') });
    return <D2PhoneField control={control} />;
}

const meta: Meta<typeof PhoneFieldStory> = {
    title: 'mantine/widgets/D2PhoneField',
    component: PhoneFieldStory,
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
type Story = StoryObj<typeof PhoneFieldStory>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const input = canvasElement.querySelector('input[type="tel"]') as HTMLInputElement;
        await expect(input).toBeInTheDocument();
        await userEvent.type(input, '+255700000000');
        await expect(input).toHaveValue('+255700000000');
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
        const input = canvasElement.querySelector('input[type="tel"]') as HTMLInputElement;
        await expect(input).toBeRequired();
    },
};
