import { Checkbox } from '@mantine/core';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';
import { useMemo } from 'react';

export function D2TrueOnlyField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = useMemo(() => control, [control]);
    const { validationText, hasError } = useMemo(() => resolveFieldValidation(control), [control]);

    return (
        <Checkbox
            name={field.name}
            label={fieldConfig.label}
            description={fieldConfig.description}
            required={isMandatory}
            disabled={isDisabled}
            checked={field.value === 'true'}
            error={hasError ? validationText : undefined}
            onChange={(event) => {
                field.onChange(event.currentTarget.checked ? 'true' : '');
            }}
            onBlur={field.onBlur}
        />
    );
}
