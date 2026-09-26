import { MultiSelectField, MultiSelectOption } from '@dhis2/ui';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import {
    joinMultiTextValue,
    parseMultiTextValue,
    resolveFieldValidation,
} from '@nnkogift/dhis2-form-utils-hooks';
import { useMemo } from 'react';

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
