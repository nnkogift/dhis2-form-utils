import { Checkbox, FormControlLabel } from '@mui/material';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';

export function D2TrueOnlyField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);

    return (
        <FormControlLabel
            control={
                <Checkbox
                    name={field.name}
                    checked={field.value === 'true'}
                    disabled={isDisabled}
                    onChange={(event) => {
                        field.onChange(event.target.checked ? 'true' : '');
                    }}
                    onBlur={field.onBlur}
                />
            }
            label={fieldConfig.label}
            required={isMandatory}
            {...(hasError ? { helperText: validationText } : {})}
        />
    );
}
