import { Box, Button, FormHelperText, Typography } from '@mui/material';
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
            <Typography variant="body2" color="text.secondary">
                No location set
            </Typography>
        );
    }

    return (
        <Box component="dl" sx={{ display: 'flex', gap: 2, m: 0 }}>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'baseline' }}>
                <Typography
                    component="dt"
                    variant="caption"
                    color="text.secondary"
                    sx={{ m: 0, textTransform: 'uppercase', fontWeight: 600 }}
                >
                    Lat
                </Typography>
                <Typography
                    component="dd"
                    variant="body2"
                    sx={{ m: 0, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}
                >
                    {parsed.lat.toFixed(5)}
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'baseline' }}>
                <Typography
                    component="dt"
                    variant="caption"
                    color="text.secondary"
                    sx={{ m: 0, textTransform: 'uppercase', fontWeight: 600 }}
                >
                    Lng
                </Typography>
                <Typography
                    component="dd"
                    variant="body2"
                    sx={{ m: 0, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}
                >
                    {parsed.lng.toFixed(5)}
                </Typography>
            </Box>
        </Box>
    );
}

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
