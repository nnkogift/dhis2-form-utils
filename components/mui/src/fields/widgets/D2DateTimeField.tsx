import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';
import { parseDayjs, withLocalization } from './dateHelpers';

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
