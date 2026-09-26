import { MenuItem, TextField } from '@mui/material';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import {
    joinMultiTextValue,
    parseMultiTextValue,
    resolveFieldValidation,
} from '@nnkogift/dhis2-form-utils-hooks';

// fallow-ignore-next-line complexity
export function D2MultiSelectField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);
    const options = control.visibleOptions ?? fieldConfig.optionSet?.options ?? [];
    const selected = parseMultiTextValue(field.value as string);

    return (
        <TextField
            name={field.name}
            select
            label={fieldConfig.label}
            helperText={hasError ? validationText : fieldConfig.description}
            required={isMandatory}
            disabled={isDisabled}
            value={selected}
            error={hasError}
            onChange={(event) => {
                const next = event.target.value;
                const codes = typeof next === 'string' ? parseMultiTextValue(next) : next;
                field.onChange(joinMultiTextValue(codes));
            }}
            onBlur={field.onBlur}
            fullWidth
            margin="normal"
            slotProps={{
                select: {
                    multiple: true,
                },
            }}
        >
            {options.map((option) => (
                <MenuItem key={option.code} value={option.code}>
                    {option.label}
                </MenuItem>
            ))}
        </TextField>
    );
}
