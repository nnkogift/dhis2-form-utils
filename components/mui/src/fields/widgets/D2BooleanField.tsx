import {
    FormControl,
    FormControlLabel,
    FormHelperText,
    FormLabel,
    Radio,
    RadioGroup,
} from '@mui/material';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';

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
