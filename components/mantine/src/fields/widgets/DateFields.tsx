import { DateInput, DateTimePicker, TimeInput } from '@mantine/dates';
import dayjs from 'dayjs';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { computeAgeFromDob, resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';

const today = () => dayjs().endOf('day').toDate();

const parseDate = (value: string): Date | null => {
    if (!value) return null;
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.toDate() : null;
};

const formatDate = (value: Date | null): string => (value ? dayjs(value).format('YYYY-MM-DD') : '');

const formatDateTime = (value: Date | null): string =>
    value ? dayjs(value).format('YYYY-MM-DDTHH:mm') : '';

export function D2DateField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);

    return (
        <DateInput
            name={field.name}
            label={fieldConfig.label}
            description={fieldConfig.description}
            required={isMandatory}
            disabled={isDisabled}
            valueFormat="YYYY-MM-DD"
            value={parseDate(field.value as string)}
            maxDate={fieldConfig.allowFutureDate ? undefined : today()}
            clearable={!isMandatory}
            error={hasError ? validationText : undefined}
            onChange={(value) => {
                field.onChange(formatDate(value));
            }}
            onBlur={field.onBlur}
        />
    );
}

export function D2TimeField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);

    return (
        <TimeInput
            name={field.name}
            label={fieldConfig.label}
            description={fieldConfig.description}
            required={isMandatory}
            disabled={isDisabled}
            value={field.value as string}
            error={hasError ? validationText : undefined}
            onChange={(event) => {
                field.onChange(event.currentTarget.value);
            }}
            onBlur={field.onBlur}
        />
    );
}

export function D2DateTimeField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);

    return (
        <DateTimePicker
            name={field.name}
            label={fieldConfig.label}
            description={fieldConfig.description}
            required={isMandatory}
            disabled={isDisabled}
            valueFormat="YYYY-MM-DD HH:mm"
            value={parseDate(field.value as string)}
            maxDate={fieldConfig.allowFutureDate ? undefined : today()}
            clearable={!isMandatory}
            error={hasError ? validationText : undefined}
            onChange={(value) => {
                field.onChange(formatDateTime(value));
            }}
            onBlur={field.onBlur}
        />
    );
}

export function D2AgeField({ control }: WidgetProps) {
    const age = computeAgeFromDob(control.field.value as string);
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
