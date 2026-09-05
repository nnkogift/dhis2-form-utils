import { Provider } from '@dhis2/app-runtime';
import { FormStateProvider, useTrackerForm } from '@nnkogift/dhis2-form-utils-hooks';
import type { TrackerProgramMetadata } from '@nnkogift/dhis2-form-utils-metadata';
import type { Decorator } from '@storybook/react-vite';
import { createContext, type CSSProperties, type ReactNode, useContext, useMemo } from 'react';
import { FormProvider, type UseFormReturn } from 'react-hook-form';

const runtimeConfig = {
    baseUrl: 'https://debug.dhis2.org',
    apiVersion: 41,
    serverVersion: { major: 2, minor: 41, full: '2.41.0' },
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
    /** Overrides the default single-column `maxWidth: 480` wrapper, e.g. for side-by-side layouts. */
    containerStyle?: CSSProperties;
    /** Overrides the default `2.41.0` runtime server version, e.g. to exercise v43+ behavior. */
    serverVersion?: { major: number; minor: number; full: string };
};

export function TrackerFormWrapper({
    children,
    programId,
    metadata,
    defaultValues,
    containerStyle,
    serverVersion,
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
            config={serverVersion ? { ...runtimeConfig, serverVersion } : runtimeConfig}
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
                        <div style={containerStyle ?? { maxWidth: 480, padding: 16 }}>
                            {children}
                        </div>
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
