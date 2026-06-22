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
            value={field.value}
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

export function D2LongTextField(props: WidgetProps) {
    return <D2TextField {...props} multiline />;
}

export function D2EmailField(props: WidgetProps) {
    return <D2TextField {...props} type="email" />;
}

export function D2PhoneField(props: WidgetProps) {
    return <D2TextField {...props} type="tel" />;
}

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
            value={field.value}
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

export function D2TimeField(props: WidgetProps) {
    return <D2TextField {...props} type="time" />;
}

export function D2DateField(props: WidgetProps) {
    return <D2TextField {...props} type="date" />;
}

function computeAgeFromDob(dob: string): string {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return '';
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age -= 1;
    }
    return age >= 0 ? String(age) : '';
}

export function D2AgeField({ control }: WidgetProps) {
    const age = computeAgeFromDob(control.field.value);
    const description = [control.fieldConfig.description, age ? `Age: ${age} years` : undefined]
        .filter(Boolean)
        .join(' · ');

    return (
        <D2TextField
            control={{
                ...control,
                fieldConfig: {
                    ...control.fieldConfig,
                    description,
                },
            }}
            type="date"
        />
    );
}

export function D2BooleanField({ control }: WidgetProps) {
    const { fieldConfig, field, isDisabled } = control;

    return (
        <ToggleButtonGroup
            exclusive
            value={field.value}
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
            value={field.value}
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

export function D2UnsupportedField({ control }: WidgetProps) {
    const { fieldConfig, field, widgetKind, isMandatory } = control;
    const { hasError } = resolveFieldValidation(control);

    return (
        <TextField
            name={field.name}
            value={field.value}
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
