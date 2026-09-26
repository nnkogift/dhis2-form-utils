import { InputField } from '@dhis2/ui';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';

/** Shared by D2EmailField / D2PhoneField / D2NumberField / D2IntegerField — same widget, different HTML input `type`. */
export function TypedTextField({
    control,
    type,
}: WidgetProps & { type?: 'email' | 'tel' | 'number' }) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError, hasWarning } = resolveFieldValidation(control);

    return (
        <InputField
            name={field.name}
            value={field.value as string}
            label={fieldConfig.label}
            helpText={fieldConfig.description}
            required={isMandatory}
            disabled={isDisabled}
            type={type}
            warning={hasWarning}
            error={hasError}
            validationText={validationText}
            onChange={({ value }) => {
                field.onChange(value ?? '');
            }}
            onBlur={field.onBlur}
        />
    );
}
