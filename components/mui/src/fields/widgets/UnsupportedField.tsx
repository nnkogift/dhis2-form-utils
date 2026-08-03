import { TextField } from '@mui/material';
import type { WidgetProps } from '@dhis2-form-utils/hooks';
import { resolveFieldValidation } from '@dhis2-form-utils/hooks';

export function D2UnsupportedField({ control }: WidgetProps) {
    const { fieldConfig, field, widgetKind, isMandatory } = control;
    const { hasError } = resolveFieldValidation(control);

    return (
        <TextField
            name={field.name}
            value={field.value as string}
            label={fieldConfig.label}
            helperText={`Widget not yet implemented: ${widgetKind}`}
            required={isMandatory}
            disabled
            error={hasError}
            onChange={(event) => {
                field.onChange(event.target.value);
            }}
            onBlur={field.onBlur}
            fullWidth
            margin="normal"
        />
    );
}
