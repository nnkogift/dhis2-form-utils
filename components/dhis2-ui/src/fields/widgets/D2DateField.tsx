import { CalendarInput } from '@dhis2/ui';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';

export const todayIso = (): string => new Date().toISOString().slice(0, 10);

export type DateSelectPayload = {
    calendarDateString?: string;
} | null;

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
