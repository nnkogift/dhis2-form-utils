// fallow-ignore-file code-duplication
import { Chip } from '@dhis2/ui';
import { parseGeojsonGeometry } from '@nnkogift/dhis2-form-utils-map';

import './fieldWidgetLayout.css';

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
export function GeometrySummary({ value }: { value: string }) {
    const geometry = parseGeojsonGeometry(value);
    if (!geometry) {
        return <span className="d2-field-muted">No geometry set</span>;
    }
    if (geometry.type === 'Point') {
        return <Chip dense>{geometry.type}</Chip>;
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
        <div className="d2-geojson-summary">
            <Chip dense>{geometry.type}</Chip>
            <span className="d2-geojson-meta">
                {count} {noun}
            </span>
        </div>
    );
}
