import { createContext, useContext, type ReactNode } from 'react';
import type { FieldStateMap } from '@dhis2-form-utils/rules';
import { createEmptyFieldState } from '@dhis2-form-utils/rules';

const FieldStateContext = createContext<FieldStateMap>({});

export type FieldStateProviderProps = {
    value: FieldStateMap;
    children: ReactNode;
};

export function FieldStateProvider({ value, children }: FieldStateProviderProps) {
    return <FieldStateContext.Provider value={value}>{children}</FieldStateContext.Provider>;
}

export function useFieldState(name: string) {
    const fieldState = useContext(FieldStateContext);
    return fieldState[name] ?? createEmptyFieldState();
}
