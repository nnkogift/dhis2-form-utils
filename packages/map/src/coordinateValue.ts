export type CoordinateValue = { lng: number; lat: number };

const LNG_MIN = -180;
const LNG_MAX = 180;
const LAT_MIN = -90;
const LAT_MAX = 90;

/**
 * Parses a DHIS2 `COORDINATE` value-type string, wire format `"[lng,lat]"`
 * (matches DHIS2 tracker API's coordinate/GeoJSON Point ordering).
 * Returns `null` for empty, malformed, or out-of-range input.
 */
export function parseCoordinateValue(value: string): CoordinateValue | null {
    if (!value) return null;

    let parsed: unknown;
    try {
        parsed = JSON.parse(value);
    } catch {
        return null;
    }

    if (!Array.isArray(parsed) || parsed.length !== 2) return null;
    const lng: unknown = parsed[0];
    const lat: unknown = parsed[1];
    if (typeof lng !== 'number' || typeof lat !== 'number') return null;
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
    if (lng < LNG_MIN || lng > LNG_MAX || lat < LAT_MIN || lat > LAT_MAX) return null;

    return { lng, lat };
}

/** Serializes a longitude/latitude pair to the DHIS2 `"[lng,lat]"` wire format. */
export function joinCoordinateValue(lng: number, lat: number): string {
    return JSON.stringify([lng, lat]);
}
