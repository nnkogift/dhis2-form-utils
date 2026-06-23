import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useMemo,
    useSyncExternalStore,
} from 'react';
import type { UseFormReturn } from 'react-hook-form';
import {
    createEmptyFieldState,
    createEmptySectionState,
    type FeedbackMap,
    type FieldState,
    type SectionState,
} from '@dhis2-form-utils/rules';
import type { FormStore } from './formStore';
import type { FieldStateStore } from './store/fieldStateStore';
import type { NonFieldStateStore } from './store/nonFieldStateStore';

export type FormStateContextValue = {
    form: UseFormReturn<Record<string, unknown>>;
    fieldStore: FieldStateStore;
    nonFieldStore: NonFieldStateStore;
    formStore: FormStore;
};

const FormStateContext = createContext<FormStateContextValue | null>(null);

export type FormStateProviderProps = {
    formStore: FormStore;
    form: UseFormReturn<Record<string, unknown>>;
    children: ReactNode;
};

export function FormStateProvider({ formStore, form, children }: FormStateProviderProps) {
    const value = useMemo(() => {
        return {
            form,
            fieldStore: formStore.fieldStore,
            nonFieldStore: formStore.nonFieldStore,
            formStore,
        };
    }, [form, formStore]);

    return <FormStateContext.Provider value={value}>{children}</FormStateContext.Provider>;
}

export function useFormStateContext(): FormStateContextValue {
    const ctx = useContext(FormStateContext);
    if (!ctx) {
        throw new Error('useFormStateContext must be used inside FormStateProvider');
    }
    return ctx;
}

export function useFieldState(fieldId: string): FieldState {
    const { fieldStore } = useFormStateContext();

    const snapshot = useSyncExternalStore(
        useCallback((cb) => fieldStore.subscribe(fieldId, cb), [fieldStore, fieldId]),
        useCallback(() => fieldStore.getFieldSnapshot(fieldId), [fieldStore, fieldId]),
        useCallback(() => fieldStore.getFieldSnapshot(fieldId), [fieldStore, fieldId])
    );

    return snapshot ?? createEmptyFieldState();
}

export function useSectionState(sectionId: string): SectionState {
    const { nonFieldStore } = useFormStateContext();

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
    const { nonFieldStore } = useFormStateContext();

    return useSyncExternalStore(
        useCallback((cb) => nonFieldStore.subscribeFeedback(cb), [nonFieldStore]),
        useCallback(() => nonFieldStore.getFeedbackSnapshot(), [nonFieldStore]),
        useCallback(() => nonFieldStore.getFeedbackSnapshot(), [nonFieldStore])
    );
}
