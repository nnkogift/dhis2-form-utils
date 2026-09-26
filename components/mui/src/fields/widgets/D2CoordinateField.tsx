import { Box, Button, FormHelperText } from '@mui/material';
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
        <Box sx={{ my: 2 }}>
            <FormHelperText>
                {fieldConfig.label}
                {isMandatory ? ' *' : ''}
            </FormHelperText>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CoordinateSummary value={value} />
                <Button
                    size="small"
                    variant="outlined"
                    disabled={isDisabled}
                    onClick={() => {
                        setIsOpen(true);
                    }}
                >
                    {value ? 'Change location' : 'Set location'}
                </Button>
            </Box>
            {hasError && validationText ? (
                <FormHelperText error>{validationText}</FormHelperText>
            ) : null}
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
        </Box>
    );
}
