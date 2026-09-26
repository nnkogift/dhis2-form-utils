import type { Geometry } from 'geojson';

/**
 * DHIS2 `GEOJSON` value-type strings hold a single GeoJSON *geometry*
 * (Point/LineString/Polygon/...), not a full `Feature` or `FeatureCollection`.
 *
 * This assumption was NOT conclusively verified against DHIS2's own API docs
 * during planning — verify against a live DHIS2 instance (create a
 * GEOJSON-valueType data element, submit a value via Capture/Tracker Capture,
 * inspect the stored/returned JSON shape) before treating this as final. If
 * DHIS2 actually expects/returns a `Feature` wrapper, this module's
 * parse/stringify pair — and the `buildFieldSchema`/`buildTeaFieldSchema`
 * validators built on top of it — need a follow-up patch.
 */

const GEOMETRY_TYPES = new Set([
    'Point',
    'MultiPoint',
    'LineString',
    'MultiLineString',
    'Polygon',
    'MultiPolygon',
    'GeometryCollection',
]);

function isGeometryShape(value: unknown): value is Geometry {
    if (typeof value !== 'object' || value === null) return false;
    const candidate = value as { type?: unknown; coordinates?: unknown; geometries?: unknown };
    if (typeof candidate.type !== 'string' || !GEOMETRY_TYPES.has(candidate.type)) return false;
    if (candidate.type === 'GeometryCollection') return Array.isArray(candidate.geometries);
    return Array.isArray(candidate.coordinates);
}

/** Parses a `GEOJSON` value-type string into a GeoJSON geometry, or `null` if invalid/empty. */
export function parseGeojsonGeometry(value: string): Geometry | null {
    if (!value) return null;

    let parsed: unknown;
    try {
        parsed = JSON.parse(value);
    } catch {
        return null;
    }

    return isGeometryShape(parsed) ? parsed : null;
}

/** Serializes a GeoJSON geometry to the DHIS2 `GEOJSON` value-type wire format. */
export function stringifyGeojsonGeometry(geometry: Geometry): string {
    return JSON.stringify(geometry);
}

/** Returns `true` when `value` is a valid, non-empty GeoJSON geometry string. */
export function isValidGeojsonGeometry(value: string): boolean {
    return parseGeojsonGeometry(value) !== null;
}
