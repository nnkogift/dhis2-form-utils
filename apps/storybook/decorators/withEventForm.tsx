import { Provider } from '@dhis2/app-runtime';
import { FormStateProvider, useEventForm } from '@nnkogift/dhis2-form-utils-hooks';
import type { EventProgramMetadata, OptionGroupCodeMap } from '@nnkogift/dhis2-form-utils-metadata';
import { selectProgramStage } from '@nnkogift/dhis2-form-utils-metadata';
import type { Decorator } from '@storybook/react-vite';
import { createContext, type ReactNode, useContext, useMemo } from 'react';
import { FormProvider, type UseFormReturn } from 'react-hook-form';

const runtimeConfig = {
    baseUrl: 'https://debug.dhis2.org',
    apiVersion: 41,
};

type EventFormStoryContextValue = {
    metadata: EventProgramMetadata;
    stageMetadata: ReturnType<typeof selectProgramStage>;
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
    metadata: EventProgramMetadata;
    defaultValues?: Record<string, string>;
    optionGroups?: OptionGroupCodeMap;
};

export function EventFormWrapper({
    children,
    programStageId,
    metadata,
    defaultValues,
    optionGroups,
}: {
    children: ReactNode;
} & EventFormDecoratorOptions) {
    const stableMetadata = useMemo(() => metadata, [metadata]);
    const stageMetadata = useMemo(
        () => selectProgramStage(stableMetadata, programStageId),
        [stableMetadata, programStageId]
    );
    const { form, formStore } = useEventForm({
        options: {
            programStageId,
            metadata: stableMetadata,
            optionGroups,
        },
        formOptions: {
            defaultValues,
        },
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
                    <EventFormStoryContext.Provider
                        value={{ metadata: stableMetadata, stageMetadata }}
                    >
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
