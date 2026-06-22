import type { FieldControlReturn } from './useFieldControl';

export function resolveFieldValidation(control: FieldControlReturn) {
    const validationText =
        control.errorMessage ?? control.fieldState.error?.message ?? control.warningMessage;
    const hasError = control.hasError || control.fieldState.invalid;
    const hasWarning = control.hasWarning && !hasError;

    return { validationText, hasError, hasWarning };
}
