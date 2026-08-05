import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, { type Dayjs } from 'dayjs';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { computeAgeFromDob, resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';
import type { ReactNode } from 'react';

const parseDayjs = (value: string): Dayjs | null => {
    if (!value) return null;
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed : null;
};

function withLocalization(children: ReactNode) {
    return <LocalizationProvider dateAdapter={AdapterDayjs}>{children}</LocalizationProvider>;
}

export function D2DateField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);

    return withLocalization(
        <DatePicker
            name={field.name}
            label={fieldConfig.label}
            disabled={isDisabled}
            value={parseDayjs(field.value as string)}
            maxDate={fieldConfig.allowFutureDate ? undefined : dayjs()}
            format="YYYY-MM-DD"
            onChange={(value) => {
                field.onChange(value && value.isValid() ? value.format('YYYY-MM-DD') : '');
            }}
            slotProps={{
                textField: {
                    name: field.name,
                    required: isMandatory,
                    helperText: hasError ? validationText : fieldConfig.description,
                    error: hasError,
                    onBlur: field.onBlur,
                    fullWidth: true,
                    margin: 'normal',
                },
                field: {
                    clearable: !isMandatory,
                },
            }}
        />
    );
}

// fallow-ignore-next-line complexity
export function D2TimeField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);
    const value = field.value as string;
    const parsed = value ? dayjs(`1970-01-01T${value}`) : null;

    return withLocalization(
        <TimePicker
            name={field.name}
            label={fieldConfig.label}
            disabled={isDisabled}
            value={parsed && parsed.isValid() ? parsed : null}
            ampm={false}
            format="HH:mm"
            onChange={(next) => {
                field.onChange(next && next.isValid() ? next.format('HH:mm') : '');
            }}
            slotProps={{
                textField: {
                    name: field.name,
                    required: isMandatory,
                    helperText: hasError ? validationText : fieldConfig.description,
                    error: hasError,
                    onBlur: field.onBlur,
                    fullWidth: true,
                    margin: 'normal',
                },
                field: {
                    clearable: !isMandatory,
                },
            }}
        />
    );
}

export function D2DateTimeField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);

    return withLocalization(
        <DateTimePicker
            name={field.name}
            label={fieldConfig.label}
            disabled={isDisabled}
            value={parseDayjs(field.value as string)}
            maxDate={fieldConfig.allowFutureDate ? undefined : dayjs()}
            ampm={false}
            format="YYYY-MM-DD HH:mm"
            onChange={(value) => {
                field.onChange(value && value.isValid() ? value.format('YYYY-MM-DDTHH:mm') : '');
            }}
            slotProps={{
                textField: {
                    name: field.name,
                    required: isMandatory,
                    helperText: hasError ? validationText : fieldConfig.description,
                    error: hasError,
                    onBlur: field.onBlur,
                    fullWidth: true,
                    margin: 'normal',
                },
                field: {
                    clearable: !isMandatory,
                },
            }}
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
