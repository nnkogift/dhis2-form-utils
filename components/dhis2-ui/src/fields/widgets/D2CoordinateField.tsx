import { Button, Field, colors } from '@dhis2/ui';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';
import { parseCoordinateValue } from '@nnkogift/dhis2-form-utils-map';
import type { CSSProperties } from 'react';
import { useState } from 'react';

import { CoordinateLocationModal } from './CoordinateLocationModal';

const labelStyle: CSSProperties = {
    margin: 0,
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: colors.grey700,
};

const valueStyle: CSSProperties = {
    margin: 0,
    fontSize: 14,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
};

// A definition list pairs each axis label with its value for assistive tech, and tabular figures
// keep the digits from jittering in width as the user edits the pair.
function CoordinateSummary({ value }: { value: string }) {
    const parsed = parseCoordinateValue(value);
    if (!parsed) {
        return <span style={{ color: colors.grey700 }}>No location set</span>;
    }

    return (
        <dl style={{ display: 'flex', gap: 16, margin: 0 }}>
            <div style={{ display: 'flex', gap: 4, alignItems: 'baseline' }}>
                <dt style={labelStyle}>Lat</dt>
                <dd style={valueStyle}>{parsed.lat.toFixed(5)}</dd>
            </div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'baseline' }}>
                <dt style={labelStyle}>Lng</dt>
                <dd style={valueStyle}>{parsed.lng.toFixed(5)}</dd>
            </div>
        </dl>
    );
}

export function D2CoordinateField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError, hasWarning } = resolveFieldValidation(control);
    const value = field.value as string;
    const [isOpen, setIsOpen] = useState(false);

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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CoordinateSummary value={value} />
                <Button
                    small
                    disabled={isDisabled}
                    onClick={() => {
                        setIsOpen(true);
                    }}
                >
                    {value ? 'Change location' : 'Set location'}
                </Button>
            </div>
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
        </Field>
    );
}
