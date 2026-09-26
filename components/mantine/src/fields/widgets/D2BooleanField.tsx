import { Group, Radio } from '@mantine/core';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';
import { useMemo } from 'react';

const BOOLEAN_OPTIONS = [
    { label: 'Yes', value: 'true' },
    { label: 'No', value: 'false' },
];

export function D2BooleanField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = useMemo(() => control, [control]);
    const { validationText, hasError } = useMemo(() => resolveFieldValidation(control), [control]);

    return (
        <Radio.Group
            name={field.name}
            label={fieldConfig.label}
            description={fieldConfig.description}
            value={(field.value as string | undefined) ?? ''}
            required={isMandatory}
            onChange={(value) => {
                field.onChange(value);
            }}
            onBlur={field.onBlur}
            error={hasError ? validationText : undefined}
        >
            <Group mt="xs">
                {BOOLEAN_OPTIONS.map((option) => (
                    <Radio
                        key={option.label}
                        value={option.value}
                        label={option.label}
                        disabled={isDisabled}
                    />
                ))}
            </Group>
        </Radio.Group>
    );
}
