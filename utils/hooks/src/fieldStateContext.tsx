import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useSyncExternalStore,
    type ReactNode,
} from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { createEmptyFieldState, type FieldState } from '@dhis2-form-utils/rules';
import type { FieldStateStore } from './store/fieldStateStore';

type FormStateContextValue = {
    store: FieldStateStore;
    form: UseFormReturn<Record<string, unknown>>;
};

const FormStateContext = createContext<FormStateContextValue | null>(null);

export type FormStateProviderProps = {
    store: FieldStateStore;
    form: UseFormReturn<Record<string, unknown>>;
    children: ReactNode;
};

export function FormStateProvider({ store, form, children }: FormStateProviderProps) {
    const value = useMemo(() => ({ store, form }), [store, form]);
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
    const { store } = useFormStateContext();

    const snapshot = useSyncExternalStore(
        useCallback((cb) => store.subscribeField(fieldId, cb), [store, fieldId]),
        useCallback(() => store.getFieldState(fieldId), [store, fieldId]),
        useCallback(() => store.getFieldState(fieldId), [store, fieldId])
    );

    return snapshot ?? createEmptyFieldState();
}
