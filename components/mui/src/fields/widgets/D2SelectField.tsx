import { MenuItem, TextField } from '@mui/material';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';

// fallow-ignore-next-line complexity
export function D2SelectField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);
    const options = control.visibleOptions ?? fieldConfig.optionSet?.options ?? [];

    return (
        <TextField
            name={field.name}
            select
            label={fieldConfig.label}
            helperText={hasError ? validationText : fieldConfig.description}
            required={isMandatory}
            disabled={isDisabled}
            value={field.value as string}
            error={hasError}
            onChange={(event) => {
                field.onChange(event.target.value);
            }}
            onBlur={field.onBlur}
            fullWidth
            margin="normal"
        >
            {options.map((option) => (
                <MenuItem key={option.code} value={option.code}>
                    {option.label}
                </MenuItem>
            ))}
        </TextField>
    );
}
