import { Textarea, TextInput } from '@mantine/core';
import type { WidgetProps } from '@dhis2-form-utils/hooks';
import { resolveFieldValidation } from '@dhis2-form-utils/hooks';

type D2TextFieldOptions = {
    type?: string;
};

export function D2TextField({ control, type }: WidgetProps & D2TextFieldOptions) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);

    return (
        <TextInput
            name={field.name}
            value={field.value}
            label={fieldConfig.label}
            description={fieldConfig.description}
            required={isMandatory}
            disabled={isDisabled}
            type={type}
            error={hasError ? validationText : undefined}
            onChange={(event) => {
                field.onChange(event.currentTarget.value);
            }}
            onBlur={field.onBlur}
        />
    );
}

export function D2LongTextField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);

    return (
        <Textarea
            name={field.name}
            value={field.value}
            label={fieldConfig.label}
            description={fieldConfig.description}
            required={isMandatory}
            disabled={isDisabled}
            error={hasError ? validationText : undefined}
            onChange={(event) => {
                field.onChange(event.currentTarget.value);
            }}
            onBlur={field.onBlur}
        />
    );
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

export function D2DateField(props: WidgetProps) {
    return <D2TextField {...props} type="date" />;
}

export function D2AgeField({ control }: WidgetProps) {
    const age = computeAgeFromDob(control.field.value);
    const description = [control.fieldConfig.description, age ? `Age: ${age} years` : undefined]
        .filter(Boolean)
        .join(' · ');

    return (
        <D2DateField
            control={{
                ...control,
                fieldConfig: {
                    ...control.fieldConfig,
                    description,
                },
            }}
        />
    );
}
