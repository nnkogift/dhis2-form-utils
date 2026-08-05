import { CalendarInput, InputField } from '@dhis2/ui';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { computeAgeFromDob, resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';

const todayIso = (): string => new Date().toISOString().slice(0, 10);

type DateSelectPayload = {
    calendarDateString?: string;
} | null;

const readDatePart = (value: string): string => {
    if (!value) return '';
    return value.includes('T') ? value.slice(0, 10) : value;
};

const readTimePart = (value: string): string => {
    if (!value.includes('T')) return '';
    return value.slice(11, 16);
};

export function D2DateField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError, hasWarning } = resolveFieldValidation(control);
    const dateValue = field.value as string;

    return (
        <CalendarInput
            name={field.name}
            label={fieldConfig.label}
            helpText={fieldConfig.description}
            required={isMandatory}
            disabled={isDisabled}
            warning={hasWarning}
            error={hasError}
            validationText={validationText}
            calendar="gregory"
            format="YYYY-MM-DD"
            date={dateValue || undefined}
            clearable={!isMandatory}
            pastOnly={!fieldConfig.allowFutureDate}
            maxDate={fieldConfig.allowFutureDate ? undefined : todayIso()}
            onDateSelect={(payload: DateSelectPayload) => {
                field.onChange(payload?.calendarDateString ?? '');
            }}
            onBlur={field.onBlur}
        />
    );
}

export function D2TimeField({ control }: WidgetProps) {
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
            type="time"
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

export function D2DateTimeField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError, hasWarning } = resolveFieldValidation(control);
    const value = field.value as string;
    const datePart = readDatePart(value);
    const timePart = readTimePart(value);

    const commit = (nextDate: string, nextTime: string) => {
        if (!nextDate && !nextTime) {
            field.onChange('');
            return;
        }
        field.onChange(`${nextDate}T${nextTime || '00:00'}`);
    };

    return (
        <div>
            <CalendarInput
                name={`${field.name}-date`}
                label={fieldConfig.label}
                helpText={fieldConfig.description}
                required={isMandatory}
                disabled={isDisabled}
                warning={hasWarning}
                error={hasError}
                validationText={validationText}
                calendar="gregory"
                format="YYYY-MM-DD"
                date={datePart || undefined}
                clearable={!isMandatory}
                pastOnly={!fieldConfig.allowFutureDate}
                maxDate={fieldConfig.allowFutureDate ? undefined : todayIso()}
                onDateSelect={(payload: DateSelectPayload) => {
                    commit(payload?.calendarDateString ?? '', timePart);
                }}
                onBlur={field.onBlur}
            />
            <InputField
                name={`${field.name}-time`}
                value={timePart}
                label={`${fieldConfig.label} (time)`}
                required={isMandatory}
                disabled={isDisabled}
                type="time"
                warning={hasWarning}
                error={hasError}
                onChange={({ value: nextTime }) => {
                    commit(datePart, nextTime ?? '');
                }}
                onBlur={field.onBlur}
            />
        </div>
    );
}

export function D2AgeField({ control }: WidgetProps) {
    const age = computeAgeFromDob(control.field.value as string);
    const helpText = [control.fieldConfig.description, age ? `Age: ${age} years` : undefined]
        .filter(Boolean)
        .join(' · ');

    return (
        <D2DateField
            control={{
                ...control,
                fieldConfig: {
                    ...control.fieldConfig,
                    description: helpText || control.fieldConfig.description,
                },
            }}
        />
    );
}
