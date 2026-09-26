import { Button, Group } from '@mantine/core';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';
import { useState } from 'react';

import { CoordinateLocationModal } from './CoordinateLocationModal';
import { CoordinateSummary } from './CoordinateSummary';

// fallow-ignore-next-line complexity
export function D2CoordinateField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);
    const value = field.value as string;
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <label>
                {fieldConfig.label}
                {isMandatory ? ' *' : ''}
            </label>
            {fieldConfig.description ? <p>{fieldConfig.description}</p> : null}
            <Group gap="sm" align="center">
                <CoordinateSummary value={value} />
                <Button
                    size="xs"
                    variant="light"
                    disabled={isDisabled}
                    onClick={() => {
                        setIsOpen(true);
                    }}
                >
                    {value ? 'Change location' : 'Set location'}
                </Button>
            </Group>
            {hasError && validationText ? <p>{validationText}</p> : null}
            <CoordinateLocationModal
                isOpen={isOpen}
                value={value}
                label={fieldConfig.label}
                disabled={isDisabled}
                onCancel={() => {
                    setIsOpen(false);
                }}
                onUpdate={(next) => {
                    field.onChange(next);
                    field.onBlur();
                    setIsOpen(false);
                }}
            />
        </div>
    );
}
