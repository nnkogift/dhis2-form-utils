import { Provider } from '@dhis2/app-runtime';
import { FormStateProvider, useEventForm } from '@dhis2-form-utils/hooks';
import type { ProgramStageMetadata } from '@dhis2-form-utils/metadata';
import type { Decorator } from '@storybook/react';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { FormProvider, type UseFormReturn } from 'react-hook-form';

const runtimeConfig = {
    baseUrl: 'https://debug.dhis2.org',
    apiVersion: 41,
};

type EventFormStoryContextValue = {
    submit: () => void;
    metadata: ProgramStageMetadata;
};

const EventFormStoryContext = createContext<EventFormStoryContextValue | null>(null);

export function useEventFormStory(): EventFormStoryContextValue {
    const context = useContext(EventFormStoryContext);
    if (!context) {
        throw new Error('useEventFormStory must be used inside withEventForm');
    }
    return context;
}

export type EventFormDecoratorOptions = {
    programStageId: string;
    metadata: ProgramStageMetadata;
    defaultValues?: Record<string, string>;
};

export function EventFormWrapper({
    children,
    programStageId,
    metadata,
    defaultValues,
}: {
    children: ReactNode;
} & EventFormDecoratorOptions) {
    const stableMetadata = useMemo(() => metadata, [metadata]);
    const { form, formStore, submit } = useEventForm({
        programStageId,
        metadata: stableMetadata,
        existingValues: defaultValues,
    });

    return (
        <Provider
            config={runtimeConfig}
            userInfo={undefined}
            plugin={false}
            parentAlertsAdd={undefined}
            showAlertsInPlugin={false}
        >
            <FormStateProvider
                formStore={formStore}
                form={form as UseFormReturn<Record<string, unknown>>}
            >
                <FormProvider {...form}>
                    <EventFormStoryContext.Provider value={{ submit, metadata: stableMetadata }}>
                        <div style={{ maxWidth: 480, padding: 16 }}>{children}</div>
                    </EventFormStoryContext.Provider>
                </FormProvider>
            </FormStateProvider>
        </Provider>
    );
}

export const withEventForm =
    (options: EventFormDecoratorOptions): Decorator =>
    (Story) => (
        <EventFormWrapper {...options}>
            <Story />
        </EventFormWrapper>
    );
