import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useMemo,
    useSyncExternalStore,
} from 'react';
import { FormProvider, UseFormReturn } from 'react-hook-form';
import {
    createEmptyFieldState,
    createEmptySectionState,
    type FeedbackMap,
    type FieldState,
    type SectionState,
} from '@dhis2-form-utils/rules';
import type { FormStore } from './formStore';
import { FieldStateStore } from './store/fieldStateStore';
import { NonFieldStateStore } from './store/nonFieldStateStore';

export type FormStateContextValue<T extends Record<string, unknown> = Record<string, unknown>> = {
    form: UseFormReturn<T>;
    formStore: FormStore;
};

const FormStateContext = createContext<FormStateContextValue | null>(null);

export type FormStateProviderProps<T extends Record<string, unknown> = Record<string, unknown>> = {
    formStore: FormStore;
    form: UseFormReturn<T>;
    children: ReactNode;
};

export function FormStateProvider<T extends Record<string, unknown> = Record<string, unknown>>({
    formStore,
    form,
    children,
}: FormStateProviderProps<T>) {
    return (
        <FormStateContext.Provider
            value={{
                form,
                formStore,
            }}
        >
            <FormProvider {...form}>{children}</FormProvider>
        </FormStateContext.Provider>
    );
}

export function useFormStateContext<
    T extends Record<string, unknown> = Record<string, unknown>,
>(): FormStateContextValue<T> {
    const ctx = useContext(FormStateContext);
    if (!ctx) {
        throw new Error('useFormStateContext must be used inside FormStateProvider');
    }
    return ctx;
}

export function useFieldStore(): FieldStateStore {
    const { formStore } = useFormStateContext();
    return useMemo(() => formStore.fieldStore, [formStore.fieldStore]);
}

export function useNonFieldStore(): NonFieldStateStore {
    const { formStore } = useFormStateContext();
    return useMemo(() => formStore.nonFieldStore, [formStore.nonFieldStore]);
}

export function useFieldState(fieldId: string): FieldState {
    const fieldStore = useFieldStore();
    const snapshot = useSyncExternalStore(
        useCallback((cb) => fieldStore.subscribe(fieldId, cb), [fieldStore, fieldId]),
        useCallback(() => fieldStore.getFieldSnapshot(fieldId), [fieldStore, fieldId]),
        useCallback(() => fieldStore.getFieldSnapshot(fieldId), [fieldStore, fieldId])
    );

    return snapshot ?? createEmptyFieldState();
}

export function useSectionState(sectionId: string): SectionState {
    const nonFieldStore = useNonFieldStore();

    const snapshot = useSyncExternalStore(
        useCallback(
            (cb) => nonFieldStore.subscribeSection(sectionId, cb),
            [nonFieldStore, sectionId]
        ),
        useCallback(() => nonFieldStore.getSectionSnapshot(sectionId), [nonFieldStore, sectionId]),
        useCallback(() => nonFieldStore.getSectionSnapshot(sectionId), [nonFieldStore, sectionId])
    );

    return snapshot ?? createEmptySectionState();
}

export function useFormFeedback(): FeedbackMap {
    const nonFieldStore = useNonFieldStore();

    return useSyncExternalStore(
        useCallback((cb) => nonFieldStore.subscribeFeedback(cb), [nonFieldStore]),
        useCallback(() => nonFieldStore.getFeedbackSnapshot(), [nonFieldStore]),
        useCallback(() => nonFieldStore.getFeedbackSnapshot(), [nonFieldStore])
    );
}
