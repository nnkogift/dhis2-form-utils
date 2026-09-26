// fallow-ignore-file code-duplication
import { Box, Chip, Typography } from '@mui/material';
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
