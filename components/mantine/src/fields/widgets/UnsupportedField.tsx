import { TextInput } from '@mantine/core';
import type { WidgetProps } from '@dhis2-form-utils/hooks';
import { resolveFieldValidation } from '@dhis2-form-utils/hooks';

export function D2UnsupportedField({ control }: WidgetProps) {
    const { fieldConfig, field, widgetKind, isMandatory } = control;
    const { validationText, hasError } = resolveFieldValidation(control);

    return (
        <TextInput
            name={field.name}
            value={field.value}
            label={fieldConfig.label}
            description={`Widget not yet implemented: ${widgetKind}`}
            required={isMandatory}
            disabled
            error={hasError ? validationText : undefined}
            onChange={({ currentTarget }) => {
                field.onChange(currentTarget.value);
            }}
            onBlur={field.onBlur}
        />
    );
}
