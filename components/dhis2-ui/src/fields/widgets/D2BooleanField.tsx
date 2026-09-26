import { Field, Radio } from '@dhis2/ui';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';
import { useMemo } from 'react';

import './fieldWidgetLayout.css';

const BOOLEAN_OPTIONS = [
    { label: 'Yes', value: 'true' },
    { label: 'No', value: 'false' },
] as const;

export function D2BooleanField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = useMemo(() => control, [control]);
    const { validationText, hasError, hasWarning } = useMemo(
        () => resolveFieldValidation(control),
        [control]
    );

    return (
        <Field
            label={fieldConfig.label}
            helpText={fieldConfig.description}
            warning={hasWarning}
            error={hasError}
            required={isMandatory}
            disabled={isDisabled}
            validationText={validationText}
        >
            <div className="d2-boolean-options">
                {BOOLEAN_OPTIONS.map((option) => (
                    <Radio
                        key={option.label}
                        name={field.name}
                        label={option.label}
                        value={option.value}
                        checked={field.value === option.value}
                        disabled={isDisabled}
                        onChange={({ value }) => {
                            field.onChange(value ?? '');
                        }}
                        onBlur={field.onBlur}
                    />
                ))}
            </div>
        </Field>
    );
}
