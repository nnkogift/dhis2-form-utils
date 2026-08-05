import { TextField } from '@mui/material';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';
import { D2TextField } from './TextField';

export function D2NumberField(props: WidgetProps) {
    return <D2TextField {...props} type="number" />;
}

export function D2IntegerField(props: WidgetProps) {
    return <D2TextField {...props} type="number" />;
}

export function D2PercentageField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);

    return (
        <TextField
            name={field.name}
            value={field.value as string}
            label={fieldConfig.label}
            helperText={hasError ? validationText : fieldConfig.description}
            required={isMandatory}
            disabled={isDisabled}
            type="number"
            error={hasError}
            onChange={(event) => {
                field.onChange(event.target.value);
            }}
            onBlur={field.onBlur}
            slotProps={{ input: { endAdornment: '%' } }}
            fullWidth
            margin="normal"
        />
    );
}
