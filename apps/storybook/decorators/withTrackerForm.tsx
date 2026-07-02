import { Provider } from '@dhis2/app-runtime';
import { FormStateProvider, useTrackerForm } from '@dhis2-form-utils/hooks';
import type { TrackerProgramMetadata } from '@dhis2-form-utils/metadata';
import type { Decorator } from '@storybook/react-vite';
import { createContext, type ReactNode, useContext, useMemo } from 'react';
import { FormProvider, type UseFormReturn } from 'react-hook-form';

const runtimeConfig = {
    baseUrl: 'https://debug.dhis2.org',
    apiVersion: 41,
};

type TrackerFormStoryContextValue = {
    metadata: TrackerProgramMetadata;
};

const TrackerFormStoryContext = createContext<TrackerFormStoryContextValue | null>(null);

export function useTrackerFormStory(): TrackerFormStoryContextValue {
    const context = useContext(TrackerFormStoryContext);
    if (!context) {
        throw new Error('useTrackerFormStory must be used inside withTrackerForm');
    }
    return context;
}

export type TrackerFormDecoratorOptions = {
    programId: string;
    metadata: TrackerProgramMetadata;
    defaultValues?: Record<string, string>;
};

export function TrackerFormWrapper({
    children,
    programId,
    metadata,
    defaultValues,
}: {
    children: ReactNode;
} & TrackerFormDecoratorOptions) {
    const stableMetadata = useMemo(() => metadata, [metadata]);
    const { form, formStore } = useTrackerForm({
        options: {
            programId,
            metadata: stableMetadata,
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
                    <TrackerFormStoryContext.Provider value={{ metadata: stableMetadata }}>
                        <div style={{ maxWidth: 480, padding: 16 }}>{children}</div>
                    </TrackerFormStoryContext.Provider>
                </FormProvider>
            </FormStateProvider>
        </Provider>
    );
}

export const withTrackerForm =
    (options: TrackerFormDecoratorOptions): Decorator =>
    (Story) => (
        <TrackerFormWrapper {...options}>
            <Story />
        </TrackerFormWrapper>
    );
