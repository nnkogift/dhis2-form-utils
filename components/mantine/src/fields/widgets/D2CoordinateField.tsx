import { Button, Group, Text } from '@mantine/core';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';
import { parseCoordinateValue } from '@nnkogift/dhis2-form-utils-map';
import { useState } from 'react';

import { CoordinateLocationModal } from './CoordinateLocationModal';

// A definition list pairs each axis label with its value for assistive tech, and tabular figures
// keep the digits from jittering in width as the user edits the pair.
function CoordinateSummary({ value }: { value: string }) {
    const parsed = parseCoordinateValue(value);
    if (!parsed) {
        return (
            <Text c="dimmed" size="sm">
                No location set
            </Text>
        );
    }

    return (
        <dl style={{ display: 'flex', gap: 16, margin: 0 }}>
            <div style={{ display: 'flex', gap: 4, alignItems: 'baseline' }}>
                <Text
                    component="dt"
                    size="xs"
                    fw={600}
                    tt="uppercase"
                    c="dimmed"
                    style={{ margin: 0 }}
                >
                    Lat
                </Text>
                <Text
                    component="dd"
                    size="sm"
                    fw={500}
                    style={{ margin: 0, fontVariantNumeric: 'tabular-nums' }}
                >
                    {parsed.lat.toFixed(5)}
                </Text>
            </div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'baseline' }}>
                <Text
                    component="dt"
                    size="xs"
                    fw={600}
                    tt="uppercase"
                    c="dimmed"
                    style={{ margin: 0 }}
                >
                    Lng
                </Text>
                <Text
                    component="dd"
                    size="sm"
                    fw={500}
                    style={{ margin: 0, fontVariantNumeric: 'tabular-nums' }}
                >
                    {parsed.lng.toFixed(5)}
                </Text>
            </div>
        </dl>
    );
}

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
