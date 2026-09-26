import { TextField } from '@mui/material';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';

type D2TextFieldOptions = {
    type?: string;
    multiline?: boolean;
};

export function D2TextField({ control, type, multiline }: WidgetProps & D2TextFieldOptions) {
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
            type={type}
            multiline={multiline}
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
