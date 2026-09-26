// fallow-ignore-file code-duplication
import { NumberInput } from '@mantine/core';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';

export function D2IntegerField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);

    return (
        <NumberInput
            name={field.name}
            value={field.value === '' ? '' : Number(field.value)}
            label={fieldConfig.label}
            description={fieldConfig.description}
            required={isMandatory}
            disabled={isDisabled}
            allowDecimal={false}
            error={hasError ? validationText : undefined}
            onChange={(value) => {
                field.onChange(value === '' ? '' : String(value));
            }}
            onBlur={field.onBlur}
        />
    );
}
