import { CheckboxField } from '@dhis2/ui';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';
import { useMemo } from 'react';

export function D2TrueOnlyField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = useMemo(() => control, [control]);
    const { validationText, hasError, hasWarning } = useMemo(
        () => resolveFieldValidation(control),
        [control]
    );

    return (
        <CheckboxField
            label={fieldConfig.label}
            helpText={fieldConfig.description}
            required={isMandatory}
            disabled={isDisabled}
            warning={hasWarning}
            error={hasError}
            validationText={validationText}
            checked={field.value === 'true'}
            onChange={({ checked }) => {
                field.onChange(checked ? 'true' : '');
            }}
            onBlur={field.onBlur}
        />
    );
}
