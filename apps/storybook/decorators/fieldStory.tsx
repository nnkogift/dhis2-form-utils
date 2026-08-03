import type { WidgetKind } from '@dhis2-form-utils/hooks';
import type { Decorator, Meta } from '@storybook/react';
import { STUB_WIDGET_KINDS, TIER1_WIDGET_KINDS } from '../fixtures/fieldMetadata';
import { fieldStateFor, FormWrapper } from './withFormDecorators';

export type FieldStoryArgs = {
    widgetKind: WidgetKind;
    mandatory: boolean;
    hidden: boolean;
    warning: string;
    error: string;
    defaultValue: string;
};

export const fieldStoryDefaultArgs: FieldStoryArgs = {
    widgetKind: 'text',
    mandatory: false,
    hidden: false,
    warning: '',
    error: '',
    defaultValue: '',
};

export const fieldIdFor = (widgetKind: WidgetKind) => `field-${widgetKind}`;

/** Binds form + field-state stores to Storybook args so controls stay in sync with the rendered field. */
export const withFieldStoryForm: Decorator = (Story, { args }) => {
    const { widgetKind, mandatory, hidden, warning, error, defaultValue } = {
        ...fieldStoryDefaultArgs,
        ...(args as Partial<FieldStoryArgs>),
    };
    const fieldId = fieldIdFor(widgetKind);
    const fieldState = fieldStateFor(fieldId, {
        mandatory,
        hidden,
        ...(warning ? { warning } : {}),
        ...(error ? { error } : {}),
    });

    return (
        <FormWrapper
            key={widgetKind}
            defaultValues={{ [fieldId]: defaultValue }}
            fieldState={fieldState}
        >
            <Story />
        </FormWrapper>
    );
};

export const fieldStoryArgTypes: Meta['argTypes'] = {
    widgetKind: {
        control: 'select',
        options: [...TIER1_WIDGET_KINDS, ...STUB_WIDGET_KINDS],
    },
    mandatory: { control: 'boolean' },
    hidden: { control: 'boolean' },
    warning: { control: 'text' },
    error: { control: 'text' },
    defaultValue: { control: 'text' },
};
