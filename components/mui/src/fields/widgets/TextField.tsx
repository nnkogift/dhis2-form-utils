import { TextField } from '@mui/material';
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

export function D2LongTextField(props: WidgetProps) {
    return <D2TextField {...props} multiline />;
}

export function D2EmailField(props: WidgetProps) {
    return <D2TextField {...props} type="email" />;
}

export function D2PhoneField(props: WidgetProps) {
    return <D2TextField {...props} type="tel" />;
}

export function D2TimeField(props: WidgetProps) {
    return <D2TextField {...props} type="time" />;
}

export function D2DateField(props: WidgetProps) {
    return <D2TextField {...props} type="date" />;
}

// fallow-ignore-next-line complexity code-duplication
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
    const age = computeAgeFromDob(control.field.value as string);
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
