import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';
import { withLocalization } from './dateHelpers';

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
