import {
    Checkbox,
    FormControl,
    FormControlLabel,
    FormHelperText,
    FormLabel,
    MenuItem,
    Radio,
    RadioGroup,
    TextField,
} from '@mui/material';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import {
    joinMultiTextValue,
    parseMultiTextValue,
    resolveFieldValidation,
} from '@nnkogift/dhis2-form-utils-hooks';

// fallow-ignore-next-line complexity
export function D2BooleanField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);
    const options = isMandatory
        ? [
              { label: 'Yes', value: 'true' },
              { label: 'No', value: 'false' },
          ]
        : [
              { label: 'Yes', value: 'true' },
              { label: 'No', value: 'false' },
              { label: '—', value: '' },
          ];

    return (
        <FormControl
            component="fieldset"
            required={isMandatory}
            disabled={isDisabled}
            error={hasError}
            margin="normal"
        >
            <FormLabel component="legend">{fieldConfig.label}</FormLabel>
            {fieldConfig.description ? (
                <FormHelperText>{fieldConfig.description}</FormHelperText>
            ) : null}
            <RadioGroup
                name={field.name}
                value={field.value as string}
                onChange={(event) => {
                    field.onChange(event.target.value);
                }}
                onBlur={field.onBlur}
                row
            >
                {options.map((option) => (
                    <FormControlLabel
                        key={option.label}
                        value={option.value}
                        control={<Radio />}
                        label={option.label}
                    />
                ))}
            </RadioGroup>
            {hasError && validationText ? <FormHelperText>{validationText}</FormHelperText> : null}
        </FormControl>
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
