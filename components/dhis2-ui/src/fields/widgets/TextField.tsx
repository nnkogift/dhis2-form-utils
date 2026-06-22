import { InputField } from '@dhis2/ui';
import type { WidgetProps } from '@dhis2-form-utils/hooks';
import { resolveFieldValidation } from '@dhis2-form-utils/hooks';

export function D2TextField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError, hasWarning } = resolveFieldValidation(control);

    return (
        <InputField
            name={field.name}
            value={field.value}
            label={fieldConfig.label}
            helpText={fieldConfig.description}
            required={isMandatory}
            disabled={isDisabled}
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
