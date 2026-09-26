import { MultiSelect } from '@mantine/core';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import {
    joinMultiTextValue,
    parseMultiTextValue,
    resolveFieldValidation,
} from '@nnkogift/dhis2-form-utils-hooks';

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
