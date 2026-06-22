import { Provider } from '@dhis2/app-runtime';
import { FormStateProvider, FormStore } from '@dhis2-form-utils/hooks';
import type { FieldStateMap, SectionStateMap, FeedbackMap } from '@dhis2-form-utils/rules';
import { createEmptyFieldState } from '@dhis2-form-utils/rules';
import type { Decorator } from '@storybook/react';
import { useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

const runtimeConfig = {
    baseUrl: 'https://debug.dhis2.org',
    apiVersion: 41,
};

export type FormDecoratorOptions = {
    defaultValues?: Record<string, unknown>;
    fieldState?: FieldStateMap;
    sectionState?: SectionStateMap;
    feedback?: FeedbackMap;
};

export function FormWrapper({
    children,
    defaultValues = {},
    fieldState = {},
    sectionState = {},
    feedback = {},
}: {
    children: React.ReactNode;
    defaultValues?: Record<string, unknown>;
    fieldState?: FieldStateMap;
    sectionState?: SectionStateMap;
    feedback?: FeedbackMap;
}) {
    const form = useForm({ defaultValues });
    const formStore = useMemo(() => {
        const store = new FormStore();
        store.fieldStore.setState(fieldState);
        store.nonFieldStore.setState(sectionState, feedback);
        return store;
    }, [fieldState, feedback, sectionState]);

    return (
        <Provider
            config={runtimeConfig}
            userInfo={undefined}
            plugin={false}
            parentAlertsAdd={undefined}
            showAlertsInPlugin={false}
        >
            <FormStateProvider formStore={formStore} form={form}>
                <FormProvider {...form}>
                    <div style={{ maxWidth: 400, padding: 16 }}>{children}</div>
                </FormProvider>
            </FormStateProvider>
        </Provider>
    );
}

export const withFormDecorators =
    (options: FormDecoratorOptions = {}): Decorator =>
    (Story) => (
        <FormWrapper
            defaultValues={options.defaultValues}
            fieldState={options.fieldState}
            sectionState={options.sectionState}
            feedback={options.feedback}
        >
            <Story />
        </FormWrapper>
    );

export const fieldStateFor = (
    name: string,
    overrides: Partial<ReturnType<typeof createEmptyFieldState>>
): FieldStateMap => ({
    [name]: { ...createEmptyFieldState(), ...overrides },
});
