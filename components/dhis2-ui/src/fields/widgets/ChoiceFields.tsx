import { CheckboxField, Radio, SingleSelectField, SingleSelectOption } from '@dhis2/ui';
import type { WidgetProps } from '@dhis2-form-utils/hooks';
import { resolveFieldValidation } from '@dhis2-form-utils/hooks';

const BOOLEAN_OPTIONS = [
    { label: 'Yes', value: 'true' },
    { label: 'No', value: 'false' },
    { label: '—', value: '' },
];

const RADIO_RENDER_HINTS = new Set(['RADIO', 'VERTICAL_RADIOBUTTONS', 'HORIZONTAL_RADIOBUTTONS']);

export function D2BooleanField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError, hasWarning } = resolveFieldValidation(control);

    return (
        <SingleSelectField
            label={fieldConfig.label}
            helpText={fieldConfig.description}
            required={isMandatory}
            disabled={isDisabled}
            warning={hasWarning}
            error={hasError}
            validationText={validationText}
            selected={field.value}
            onChange={({ selected }) => {
                field.onChange(selected);
            }}
            onBlur={field.onBlur}
        >
            {BOOLEAN_OPTIONS.map((option) => (
                <SingleSelectOption key={option.value} label={option.label} value={option.value} />
            ))}
        </SingleSelectField>
    );
}

export function D2TrueOnlyField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError, hasWarning } = resolveFieldValidation(control);

    return (
        <CheckboxField
            label={fieldConfig.label}
            helpText={fieldConfig.description}
            required={isMandatory}
            disabled={isDisabled}
            warning={hasWarning}
            error={hasError}
            validationText={validationText}
            checked={field.value === 'true'}
            onChange={({ checked }) => {
                field.onChange(checked ? 'true' : '');
            }}
            onBlur={field.onBlur}
        />
    );
}

export function D2SelectField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError, hasWarning } = resolveFieldValidation(control);
    const options =
        fieldConfig.optionSet?.options.map((option) => ({
            label: option.label,
            value: option.code,
        })) ?? [];

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
            selected={field.value}
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
