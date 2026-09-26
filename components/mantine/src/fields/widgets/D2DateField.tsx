import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';
import { parseDate, today } from './dateHelpers';

const formatDate = (value: Date | null): string => (value ? dayjs(value).format('YYYY-MM-DD') : '');

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
