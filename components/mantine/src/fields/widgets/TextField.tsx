import { TextInput } from '@mantine/core';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';

type D2TextFieldOptions = {
    type?: string;
};

export function D2TextField({ control, type }: WidgetProps & D2TextFieldOptions) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);

    return (
        <TextInput
            name={field.name}
            value={field.value as string}
            label={fieldConfig.label}
            description={fieldConfig.description}
            required={isMandatory}
            disabled={isDisabled}
            type={type}
            error={hasError ? validationText : undefined}
            onChange={(event) => {
                field.onChange(event.currentTarget.value);
            }}
            onBlur={field.onBlur}
        />
    );
}
