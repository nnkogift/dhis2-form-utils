import { D2Field } from '@dhis2-form-utils/dhis2-ui';
import type { WidgetKind } from '@dhis2-form-utils/hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useFormContext } from 'react-hook-form';
import { makeFieldPsde } from '../../fixtures/fieldMetadata';
import {
    fieldStoryArgTypes,
    fieldStoryDefaultArgs,
    withFieldStoryForm,
} from '../../decorators/fieldStory';
import { fieldStoryPlays } from '../../interactions/fieldStoryInteractions';
import { fieldStateFor, withFormDecorators } from '../../decorators/withFormDecorators';

const plays = fieldStoryPlays('dhis2-ui');

function FieldStory({ widgetKind }: { widgetKind: WidgetKind }) {
    const { control } = useFormContext<Record<string, string>>();
    return (
        <D2Field
            field={{ kind: 'dataElement', config: makeFieldPsde(widgetKind) }}
            control={control}
        />
    );
}

const meta: Meta<typeof FieldStory> = {
    title: 'dhis2-ui/D2Field',
    component: FieldStory,
    tags: ['autodocs'],
    args: fieldStoryDefaultArgs,
    argTypes: fieldStoryArgTypes,
    decorators: [withFieldStoryForm],
};

export default meta;
type Story = StoryObj<typeof FieldStory>;

export const Playground: Story = {
    play: plays.textInput(),
};

export const Mandatory: Story = {
    args: { mandatory: true },
    play: plays.showsRequired,
};

export const WithWarning: Story = {
    args: { warning: 'Please verify this value' },
    play: plays.showsWarning(),
};

export const WithError: Story = {
    args: { error: 'Invalid value' },
    play: plays.showsError(),
};

export const Hidden: Story = {
    args: { hidden: true },
    play: plays.fieldHidden,
};

function DisabledFieldStory() {
    const { control } = useFormContext<Record<string, string>>();
    return (
        <D2Field
            field={{
                kind: 'trackedEntityAttribute',
                config: {
                    mandatory: false,
                    allowFutureDate: true,
                    trackedEntityAttribute: {
                        id: 'tea-trueOnly',
                        displayName: 'Generated',
                        valueType: 'TEXT',
                        generated: true,
                        unique: false,
                    },
                },
            }}
            control={control}
        />
    );
}

export const Disabled: Story = {
    render: () => <DisabledFieldStory />,
    decorators: [
        withFormDecorators({
            defaultValues: { 'tea-trueOnly': 'generated-value' },
            fieldState: fieldStateFor('tea-trueOnly', {}),
        }),
    ],
    play: plays.generatedFieldDisabled,
};

export const Integer: Story = {
    args: { widgetKind: 'integer' },
    play: plays.integerInput,
};

export const Select: Story = {
    args: { widgetKind: 'select' },
    play: plays.selectOption,
};

export const Boolean: Story = {
    args: { widgetKind: 'boolean' },
    play: plays.booleanYes,
};

export const Date: Story = {
    args: { widgetKind: 'date' },
    play: plays.dateInput,
};

export const Age: Story = {
    args: { widgetKind: 'age', defaultValue: '2000-01-01' },
    play: plays.ageShowsComputedAge,
};

export const StubWidget: Story = {
    args: { widgetKind: 'datetime' },
    play: plays.stubWidget('datetime'),
};
