import { Button, Field } from '@dhis2/ui';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';
import { useState } from 'react';

import { GeoJsonGeometryModal } from './GeoJsonGeometryModal';
import { GeometrySummary } from './GeometrySummary';
import './fieldWidgetLayout.css';

export function D2GeoJsonField({ control }: WidgetProps) {
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
            <div className="d2-field-row">
                <GeometrySummary value={value} />
                <Button
                    small
                    disabled={isDisabled}
                    onClick={() => {
                        setIsOpen(true);
                    }}
                >
                    {value ? 'Edit geometry' : 'Set geometry'}
                </Button>
            </div>
            <GeoJsonGeometryModal
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
