import type { UseFormReturn } from 'react-hook-form';

export type DefaultFormValue = Record<string, string>;

/** Widens a caller's specifically-typed RHF instance to the `Record<string, unknown>` shape the form store/context operate on internally, regardless of the caller's own `FormValue` generic. */
export function toGenericFormReturn<T extends Record<string, unknown>>(
    form: UseFormReturn<T>
): UseFormReturn<Record<string, unknown>> {
    return form as UseFormReturn<Record<string, unknown>>;
}
