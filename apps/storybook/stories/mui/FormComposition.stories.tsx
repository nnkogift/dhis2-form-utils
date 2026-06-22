import { D2Field } from '@dhis2-form-utils/mui';
import { createEmptyFieldState } from '@dhis2-form-utils/rules';
import type { FieldStateMap } from '@dhis2-form-utils/rules';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { useFormContext } from 'react-hook-form';
import { makeFieldPsde } from '../../fixtures/fieldMetadata';
import { withFormDecorators } from '../../decorators/withFormDecorators';

function ThreeFieldForm() {
    const { control } = useFormContext<Record<string, string>>();

    return (
        <div>
            <D2Field
                field={{
                    kind: 'dataElement',
                    config: makeFieldPsde('text', {
                        dataElement: {
                            id: 'firstName',
                            displayName: 'First Name',
                            displayFormName: 'First Name',
                            valueType: 'TEXT',
                        },
                    }),
                }}
                control={control}
            />
            <D2Field
                field={{
                    kind: 'dataElement',
                    config: makeFieldPsde('text', {
                        dataElement: {
                            id: 'lastName',
                            displayName: 'Last Name',
                            displayFormName: 'Last Name',
                            valueType: 'TEXT',
                        },
                    }),
                }}
                control={control}
            />
            <D2Field
                field={{
                    kind: 'dataElement',
                    config: makeFieldPsde('longText', {
                        dataElement: {
                            id: 'notes',
                            displayName: 'Notes',
                            displayFormName: 'Notes',
                            valueType: 'LONG_TEXT',
                        },
                    }),
                }}
                control={control}
            />
        </div>
    );
}

const allEmpty: FieldStateMap = {
    firstName: createEmptyFieldState(),
    lastName: createEmptyFieldState(),
    notes: createEmptyFieldState(),
};

const meta = {
    component: ThreeFieldForm,
    tags: ['ai-generated'],
} satisfies Meta<typeof ThreeFieldForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    decorators: [
        withFormDecorators({
            defaultValues: { firstName: '', lastName: '', notes: '' },
            fieldState: allEmpty,
        }),
    ],
};

export const WithValidation: Story = {
    decorators: [
        withFormDecorators({
            fieldState: {
                firstName: { ...createEmptyFieldState(), mandatory: true },
                lastName: { ...createEmptyFieldState(), error: 'This field is required' },
                notes: { ...createEmptyFieldState(), warning: 'Optional but recommended' },
            },
        }),
    ],
};

export const PartiallyHidden: Story = {
    decorators: [
        withFormDecorators({
            defaultValues: { firstName: '', lastName: '' },
            fieldState: {
                firstName: { ...createEmptyFieldState(), mandatory: true },
                lastName: createEmptyFieldState(),
                notes: { ...createEmptyFieldState(), hidden: true },
            },
        }),
    ],
    play: async ({ canvas }) => {
        const inputs = canvas.getAllByRole('textbox');
        await expect(inputs).toHaveLength(2);
    },
};
