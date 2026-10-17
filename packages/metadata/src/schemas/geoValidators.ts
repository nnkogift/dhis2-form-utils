const COORDINATE_BOUNDS = { lngMin: -180, lngMax: 180, latMin: -90, latMax: 90 };

const GEOJSON_GEOMETRY_TYPES = new Set([
    'Point',
    'MultiPoint',
    'LineString',
    'MultiLineString',
    'Polygon',
    'MultiPolygon',
    'GeometryCollection',
]);

const parseJson = (value: string): unknown => {
    try {
        return JSON.parse(value);
    } catch {
        return undefined;
    }
};

// Mirrors packages/map/src/utils/coordinateValue.ts's parseCoordinateValue — duplicated here (rather than
// depending on @nnkogift/dhis2-form-utils-map) because packages/metadata is meant to stay usable
// standalone, without pulling in a map-rendering package.
// fallow-ignore-next-line code-duplication
export const isValidCoordinateString = (value: string): boolean => {
    const parsed = parseJson(value);
    if (!Array.isArray(parsed) || parsed.length !== 2) return false;
    const lng: unknown = parsed[0];
    const lat: unknown = parsed[1];
    if (typeof lng !== 'number' || typeof lat !== 'number') return false;
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return false;
    return (
        lng >= COORDINATE_BOUNDS.lngMin &&
        lng <= COORDINATE_BOUNDS.lngMax &&
        lat >= COORDINATE_BOUNDS.latMin &&
        lat <= COORDINATE_BOUNDS.latMax
    );
};

// Mirrors packages/map/src/utils/geojsonValue.ts's isValidGeojsonGeometry — see the note above
// isValidCoordinateString for why this is duplicated rather than imported.
// fallow-ignore-next-line code-duplication
export const isValidGeojsonGeometryString = (value: string): boolean => {
    const parsed = parseJson(value);
    if (typeof parsed !== 'object' || parsed === null) return false;
    const candidate = parsed as { type?: unknown; coordinates?: unknown; geometries?: unknown };
    if (typeof candidate.type !== 'string' || !GEOJSON_GEOMETRY_TYPES.has(candidate.type))
        return false;
    if (candidate.type === 'GeometryCollection') return Array.isArray(candidate.geometries);
    return Array.isArray(candidate.coordinates);
};
