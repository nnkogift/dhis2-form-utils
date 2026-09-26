// fallow-ignore-file code-duplication
import { Badge, Group, Text } from '@mantine/core';
import { parseGeojsonGeometry } from '@nnkogift/dhis2-form-utils-map';

type ParsedGeometry = NonNullable<ReturnType<typeof parseGeojsonGeometry>>;

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

// fallow-ignore-next-line complexity
export function GeometrySummary({ value }: { value: string }) {
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
