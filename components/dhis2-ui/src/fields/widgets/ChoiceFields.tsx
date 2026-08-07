import {
    CheckboxField,
    Field,
    MultiSelectField,
    MultiSelectOption,
    Radio,
    SingleSelectField,
    SingleSelectOption,
} from '@dhis2/ui';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import {
    joinMultiTextValue,
    parseMultiTextValue,
    resolveFieldValidation,
} from '@nnkogift/dhis2-form-utils-hooks';
import { useMemo } from 'react';

const BOOLEAN_OPTIONS = [
    { label: 'Yes', value: 'true' },
    { label: 'No', value: 'false' },
] as const;

const RADIO_RENDER_HINTS = new Set(['RADIO', 'VERTICAL_RADIOBUTTONS', 'HORIZONTAL_RADIOBUTTONS']);

export function D2BooleanField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = useMemo(() => control, [control]);
    const { validationText, hasError, hasWarning } = useMemo(
        () => resolveFieldValidation(control),
        [control]
    );

    return (
        <Field
            label={fieldConfig.label}
            helpText={fieldConfig.description}
            warning={hasWarning}
            error={hasError}
            required={isMandatory}
            disabled={isDisabled}
            validationText={validationText}
        >
            <div
                style={{
                    display: 'flex',
                    gap: 16,
                }}
            >
                {BOOLEAN_OPTIONS.map((option) => (
                    <Radio
                        key={option.label}
                        name={field.name}
                        label={option.label}
                        value={option.value}
                        checked={field.value === option.value}
                        disabled={isDisabled}
                        onChange={({ value }) => {
                            field.onChange(value ?? '');
                        }}
                        onBlur={field.onBlur}
                    />
                ))}
            </div>
        </Field>
    );
}

export function D2TrueOnlyField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = useMemo(() => control, [control]);
    const { validationText, hasError, hasWarning } = useMemo(
        () => resolveFieldValidation(control),
        [control]
    );

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

export function D2MultiSelectField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError, hasWarning } = resolveFieldValidation(control);
    const options = useMemo(
        () =>
            (control.visibleOptions ?? fieldConfig.optionSet?.options ?? []).map((option) => ({
                label: option.label,
                value: option.code,
            })),
        [control.visibleOptions, fieldConfig.optionSet?.options]
    );
    const selected = parseMultiTextValue(field.value as string);

    return (
        <MultiSelectField
            label={fieldConfig.label}
            helpText={fieldConfig.description}
            required={isMandatory}
            disabled={isDisabled}
            warning={hasWarning}
            error={hasError}
            validationText={validationText}
            selected={selected}
            onChange={({ selected: nextSelected }) => {
                field.onChange(joinMultiTextValue(nextSelected));
            }}
            onBlur={field.onBlur}
        >
            {options.map((option) => (
                <MultiSelectOption key={option.value} label={option.label} value={option.value} />
            ))}
        </MultiSelectField>
    );
}
