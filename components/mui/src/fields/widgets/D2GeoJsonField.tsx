// fallow-ignore-file code-duplication
import { Box, Button, Chip, FormHelperText, Typography } from '@mui/material';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';
import { parseGeojsonGeometry } from '@nnkogift/dhis2-form-utils-map';
import { useState } from 'react';
import { GeoJsonGeometryModal } from './GeoJsonGeometryModal';

type ParsedGeometry = NonNullable<ReturnType<typeof parseGeojsonGeometry>>;

// Counts vertices across every geometry shape DHIS2's GEOJSON value type can hold, recursing into
// GeometryCollection — used only for the closed-state summary, not for validation.
// fallow-ignore-next-line complexity
function countPositions(geometry: ParsedGeometry): number {
    switch (geometry.type) {
        case 'Point':
            return 1;
        case 'MultiPoint':
        case 'LineString':
            return geometry.coordinates.length;
        case 'MultiLineString':
        case 'Polygon':
            return geometry.coordinates.reduce((sum, ring) => sum + ring.length, 0);
        case 'MultiPolygon':
            return geometry.coordinates.reduce(
                (sum, polygon) => sum + polygon.reduce((ringSum, ring) => ringSum + ring.length, 0),
                0
            );
        case 'GeometryCollection':
            return geometry.geometries.reduce((sum, member) => sum + countPositions(member), 0);
    }
}

// A single Point has nothing more to say than its type; every other shape gets a vertex/member
// count alongside the type chip so the summary distinguishes "a line" from "a 40-point line".
// fallow-ignore-next-line complexity
function GeometrySummary({ value }: { value: string }) {
    const geometry = parseGeojsonGeometry(value);
    if (!geometry) {
        return (
            <Typography variant="body2" color="text.secondary">
                No geometry set
            </Typography>
        );
    }
    if (geometry.type === 'Point') {
        return <Chip label={geometry.type} size="small" variant="outlined" />;
    }

    const count =
        geometry.type === 'GeometryCollection'
            ? geometry.geometries.length
            : countPositions(geometry);
    const noun =
        geometry.type === 'GeometryCollection'
            ? count === 1
                ? 'geometry'
                : 'geometries'
            : 'points';

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label={geometry.type} size="small" variant="outlined" />
            <Typography variant="caption" color="text.secondary">
                {count} {noun}
            </Typography>
        </Box>
    );
}

// fallow-ignore-next-line complexity
export function D2GeoJsonField({ control }: WidgetProps) {
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
                <GeometrySummary value={value} />
                <Button
                    size="small"
                    variant="outlined"
                    disabled={isDisabled}
                    onClick={() => {
                        setIsOpen(true);
                    }}
                >
                    {value ? 'Edit geometry' : 'Set geometry'}
                </Button>
            </Box>
            {hasError && validationText ? (
                <FormHelperText error>{validationText}</FormHelperText>
            ) : null}
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
        </Box>
    );
}
