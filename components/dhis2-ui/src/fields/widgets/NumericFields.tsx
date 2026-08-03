import type { WidgetProps } from '@dhis2-form-utils/hooks';
import { InputField } from '@dhis2/ui';
import { resolveFieldValidation } from '@dhis2-form-utils/hooks';
import { D2TextField } from './TextField';

function D2TypedTextField({
    control,
    type,
}: WidgetProps & { type?: 'email' | 'tel' | 'number' | 'time' | 'date' }) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError, hasWarning } = resolveFieldValidation(control);

    return (
        <InputField
            name={field.name}
            value={field.value as string}
            label={fieldConfig.label}
            helpText={fieldConfig.description}
            required={isMandatory}
            disabled={isDisabled}
            type={type}
            warning={hasWarning}
            error={hasError}
            validationText={validationText}
            onChange={({ value }) => {
                field.onChange(value ?? '');
            }}
            onBlur={field.onBlur}
        />
    );
}

export function D2EmailField(props: WidgetProps) {
    return <D2TypedTextField {...props} type="email" />;
}

export function D2PhoneField(props: WidgetProps) {
    return <D2TypedTextField {...props} type="tel" />;
}

export function D2NumberField(props: WidgetProps) {
    return <D2TypedTextField {...props} type="number" />;
}

export function D2IntegerField(props: WidgetProps) {
    return <D2TypedTextField {...props} type="number" />;
}

export function D2PercentageField({ control }: WidgetProps) {
    return (
        <D2TextField
            control={{
                ...control,
                fieldConfig: {
                    ...control.fieldConfig,
                    label: `${control.fieldConfig.label} (%)`,
                },
            }}
        />
    );
}

export function D2TimeField(props: WidgetProps) {
    return <D2TypedTextField {...props} type="time" />;
}
