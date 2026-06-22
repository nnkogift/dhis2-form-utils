import {
    createContext,
    useCallback,
    useContext,
    useRef,
    useSyncExternalStore,
    type ReactNode,
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

function MountTracker({ onUnmount, children }: { onUnmount: () => void; children: ReactNode }) {
    const onUnmountRef = useRef(onUnmount);
    onUnmountRef.current = onUnmount;

    const ref = useCallback((node: HTMLSpanElement | null) => {
        if (node === null) {
            onUnmountRef.current();
        }
    }, []);

    return (
        <span ref={ref} style={{ display: 'contents' }}>
            {children}
        </span>
    );
}

export function FormStateProvider({ formStore, form, children }: FormStateProviderProps) {
    const valueRef = useRef<FormStateContextValue | null>(null);
    if (!valueRef.current) {
        valueRef.current = {
            form,
            fieldStore: formStore.fieldStore,
            nonFieldStore: formStore.nonFieldStore,
            formStore,
        };
    }

    return (
        <MountTracker
            onUnmount={() => {
                formStore.destroy();
            }}
        >
            <FormStateContext.Provider value={valueRef.current}>
                {children}
            </FormStateContext.Provider>
        </MountTracker>
    );
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
