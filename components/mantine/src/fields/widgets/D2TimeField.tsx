import { TimeInput } from '@mantine/dates';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';

export function D2TimeField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);

    return (
        <TimeInput
            name={field.name}
            label={fieldConfig.label}
            description={fieldConfig.description}
            required={isMandatory}
            disabled={isDisabled}
            value={field.value as string}
            error={hasError ? validationText : undefined}
            onChange={(event) => {
                field.onChange(event.currentTarget.value);
            }}
            onBlur={field.onBlur}
        />
    );
}
