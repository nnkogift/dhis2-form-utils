import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';
import { parseDayjs, withLocalization } from './dateHelpers';

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
