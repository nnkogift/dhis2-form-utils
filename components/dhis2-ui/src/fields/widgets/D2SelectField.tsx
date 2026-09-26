import { Radio, SingleSelectField, SingleSelectOption } from '@dhis2/ui';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';

const RADIO_RENDER_HINTS = new Set(['RADIO', 'VERTICAL_RADIOBUTTONS', 'HORIZONTAL_RADIOBUTTONS']);

// fallow-ignore-next-line complexity
export function D2SelectField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError, hasWarning } = resolveFieldValidation(control);
    const options = (control.visibleOptions ?? fieldConfig.optionSet?.options ?? []).map(
        (option) => ({
            label: option.label,
            value: option.code,
        })
    );

    if (fieldConfig.renderTypeHint && RADIO_RENDER_HINTS.has(fieldConfig.renderTypeHint)) {
        return (
            <fieldset>
                <legend>{fieldConfig.label}</legend>
                {fieldConfig.description ? <p>{fieldConfig.description}</p> : null}
                {options.map((option) => (
                    <Radio
                        key={option.value}
                        label={option.label}
                        value={option.value}
                        checked={field.value === option.value}
                        disabled={isDisabled}
                        onChange={({ value }) => {
                            field.onChange(value ?? '');
                        }}
                    />
                ))}
                {validationText ? <p>{validationText}</p> : null}
            </fieldset>
        );
    }

    return (
        <SingleSelectField
            label={fieldConfig.label}
            helpText={fieldConfig.description}
            required={isMandatory}
            disabled={isDisabled}
            warning={hasWarning}
            error={hasError}
            validationText={validationText}
            selected={field.value as string}
            onChange={({ selected }) => {
                field.onChange(selected);
            }}
            onBlur={field.onBlur}
        >
            {options.map((option) => (
                <SingleSelectOption key={option.value} label={option.label} value={option.value} />
            ))}
        </SingleSelectField>
    );
}
