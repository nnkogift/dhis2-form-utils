import {
    Checkbox,
    FormControlLabel,
    MenuItem,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import type { WidgetProps } from '@dhis2-form-utils/hooks';
import { resolveFieldValidation } from '@dhis2-form-utils/hooks';

export function D2BooleanField({ control }: WidgetProps) {
    const { fieldConfig, field, isDisabled } = control;

    return (
        <ToggleButtonGroup
            exclusive
            value={field.value as string}
            disabled={isDisabled}
            onChange={(_event, value: string | null) => {
                field.onChange(value ?? '');
            }}
            onBlur={field.onBlur}
            aria-label={fieldConfig.label}
        >
            <ToggleButton value="true">Yes</ToggleButton>
            <ToggleButton value="false">No</ToggleButton>
            <ToggleButton value="">—</ToggleButton>
        </ToggleButtonGroup>
    );
}

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

export function D2SelectField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);
    const options = fieldConfig.optionSet?.options ?? [];

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
