import { Checkbox, MultiSelect, Radio, Select } from '@mantine/core';
import type { WidgetProps } from '@dhis2-form-utils/hooks';
import {
    joinMultiTextValue,
    parseMultiTextValue,
    resolveFieldValidation,
} from '@dhis2-form-utils/hooks';

const RADIO_RENDER_HINTS = new Set(['RADIO', 'VERTICAL_RADIOBUTTONS', 'HORIZONTAL_RADIOBUTTONS']);

export function D2BooleanField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);
    const options = isMandatory
        ? [
              { label: 'Yes', value: 'true' },
              { label: 'No', value: 'false' },
          ]
        : [
              { label: 'Yes', value: 'true' },
              { label: 'No', value: 'false' },
              { label: '—', value: '' },
          ];

    return (
        <Radio.Group
            name={field.name}
            label={fieldConfig.label}
            description={fieldConfig.description}
            value={field.value as string}
            required={isMandatory}
            onChange={(value) => {
                field.onChange(value);
            }}
            onBlur={field.onBlur}
            error={hasError ? validationText : undefined}
        >
            {options.map((option) => (
                <Radio
                    key={option.label}
                    value={option.value}
                    label={option.label}
                    disabled={isDisabled}
                />
            ))}
        </Radio.Group>
    );
}

export function D2TrueOnlyField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);

    return (
        <Checkbox
            name={field.name}
            label={fieldConfig.label}
            description={fieldConfig.description}
            required={isMandatory}
            disabled={isDisabled}
            checked={field.value === 'true'}
            error={hasError ? validationText : undefined}
            onChange={(event) => {
                field.onChange(event.currentTarget.checked ? 'true' : '');
            }}
            onBlur={field.onBlur}
        />
    );
}

// fallow-ignore-next-line complexity
export function D2SelectField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);
    const options = (control.visibleOptions ?? fieldConfig.optionSet?.options ?? []).map(
        (option) => ({
            label: option.label,
            value: option.code,
        })
    );

    if (fieldConfig.renderTypeHint && RADIO_RENDER_HINTS.has(fieldConfig.renderTypeHint)) {
        return (
            <Radio.Group
                name={field.name}
                label={fieldConfig.label}
                description={fieldConfig.description}
                value={field.value as string}
                required={isMandatory}
                onChange={(value) => {
                    field.onChange(value);
                }}
                onBlur={field.onBlur}
                error={hasError ? validationText : undefined}
            >
                {options.map((option) => (
                    <Radio
                        key={option.value}
                        value={option.value}
                        label={option.label}
                        disabled={isDisabled}
                    />
                ))}
            </Radio.Group>
        );
    }

    return (
        <Select
            name={field.name}
            label={fieldConfig.label}
            description={fieldConfig.description}
            required={isMandatory}
            disabled={isDisabled}
            data={options}
            value={(field.value as string) || null}
            error={hasError ? validationText : undefined}
            onChange={(value) => {
                field.onChange(value ?? '');
            }}
            onBlur={field.onBlur}
        />
    );
}

// fallow-ignore-next-line complexity
export function D2MultiSelectField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);
    const options = (control.visibleOptions ?? fieldConfig.optionSet?.options ?? []).map(
        (option) => ({
            label: option.label,
            value: option.code,
        })
    );

    return (
        <MultiSelect
            name={field.name}
            label={fieldConfig.label}
            description={fieldConfig.description}
            required={isMandatory}
            disabled={isDisabled}
            data={options}
            value={parseMultiTextValue(field.value as string)}
            error={hasError ? validationText : undefined}
            onChange={(value) => {
                field.onChange(joinMultiTextValue(value));
            }}
            onBlur={field.onBlur}
        />
    );
}
