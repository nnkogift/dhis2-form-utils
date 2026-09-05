// fallow-ignore-file code-duplication
import { Badge, Button, Group, Text } from '@mantine/core';
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
// count alongside the type badge so the summary distinguishes "a line" from "a 40-point line".
// fallow-ignore-next-line complexity
function GeometrySummary({ value }: { value: string }) {
    const geometry = parseGeojsonGeometry(value);
    if (!geometry) {
        return (
            <Text c="dimmed" size="sm">
                No geometry set
            </Text>
        );
    }
    if (geometry.type === 'Point') {
        return (
            <Badge variant="light" size="sm">
                {geometry.type}
            </Badge>
        );
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
        <Group gap={8} align="center">
            <Badge variant="light" size="sm">
                {geometry.type}
            </Badge>
            <Text size="xs" c="dimmed">
                {count} {noun}
            </Text>
        </Group>
    );
}

// fallow-ignore-next-line complexity
export function D2GeoJsonField({ control }: WidgetProps) {
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
                <GeometrySummary value={value} />
                <Button
                    size="xs"
                    variant="light"
                    disabled={isDisabled}
                    onClick={() => {
                        setIsOpen(true);
                    }}
                >
                    {value ? 'Edit geometry' : 'Set geometry'}
                </Button>
            </Group>
            {hasError && validationText ? <p>{validationText}</p> : null}
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
        </div>
    );
}
