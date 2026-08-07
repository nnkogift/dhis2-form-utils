import { z } from 'zod';
import type { FieldConfig } from './fieldConfig';
import { parseMultiTextValue } from './multiTextValue';

const DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
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

// Mirrors packages/map/src/coordinateValue.ts's parseCoordinateValue — duplicated here (rather
// than depending on @nnkogift/dhis2-form-utils-map) because the hooks package is meant to stay
// usable standalone, without pulling in a map-rendering package. See the same note in
// packages/metadata/src/buildTeaFieldSchema.ts.
// fallow-ignore-next-line code-duplication
// fallow-ignore-next-line complexity
const isValidCoordinateString = (value: string): boolean => {
    let parsed: unknown;
    try {
        parsed = JSON.parse(value);
    } catch {
        return false;
    }
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

// Mirrors packages/map/src/geojsonValue.ts's isValidGeojsonGeometry — see the note above
// isValidCoordinateString for why this is duplicated rather than imported.
// fallow-ignore-next-line code-duplication
const isValidGeojsonGeometryString = (value: string): boolean => {
    let parsed: unknown;
    try {
        parsed = JSON.parse(value);
    } catch {
        return false;
    }
    if (typeof parsed !== 'object' || parsed === null) return false;
    const candidate = parsed as { type?: unknown; coordinates?: unknown; geometries?: unknown };
    if (typeof candidate.type !== 'string' || !GEOJSON_GEOMETRY_TYPES.has(candidate.type))
        return false;
    if (candidate.type === 'GeometryCollection') return Array.isArray(candidate.geometries);
    return Array.isArray(candidate.coordinates);
};

const multiTextOptionSchema = (codes: string[]): z.ZodTypeAny => {
    const codeSet = new Set(codes);
    return z.string().refine(
        (value) => {
            const selected = parseMultiTextValue(value);
            return selected.length > 0 && selected.every((code) => codeSet.has(code));
        },
        { message: 'One or more selected options are invalid' }
    );
};

/**
 * Per-field Zod schema for useController validation.
 * Form values are stored as strings in RHF; this differs from buildSchema() coercion.
 */
// fallow-ignore-next-line complexity
export function buildFieldSchema(config: FieldConfig): z.ZodTypeAny {
    let base: z.ZodTypeAny;

    if (config.optionSet) {
        const codes = config.optionSet.options.map((option) => option.code);
        if (codes.length === 0) {
            base = z.string();
        } else if (config.valueType === 'MULTI_TEXT') {
            base = multiTextOptionSchema(codes);
        } else {
            base = z.enum(codes as [string, ...string[]]);
        }
    } else {
        switch (config.valueType) {
            case 'INTEGER':
                base = z.string().regex(/^-?\d+$/, 'Must be a whole number');
                break;
            case 'INTEGER_POSITIVE':
                base = z
                    .string()
                    .regex(/^\d+$/, 'Must be a positive whole number')
                    .refine((value) => parseInt(value, 10) > 0, 'Must be greater than zero');
                break;
            case 'INTEGER_NEGATIVE':
                base = z
                    .string()
                    .regex(/^-\d+$/, 'Must be a negative whole number')
                    .refine((value) => parseInt(value, 10) < 0, 'Must be less than zero');
                break;
            case 'INTEGER_ZERO_OR_POSITIVE':
                base = z
                    .string()
                    .regex(/^\d+$/, 'Must be zero or a positive whole number')
                    .refine((value) => parseInt(value, 10) >= 0, 'Must be zero or greater');
                break;
            case 'NUMBER':
            case 'UNIT_INTERVAL':
                base = z.string().regex(/^-?\d+(\.\d+)?$/, 'Must be a number');
                break;
            case 'PERCENTAGE':
                base = z
                    .string()
                    .regex(/^\d+(\.\d+)?$/, 'Must be a number')
                    .refine(
                        (value) => parseFloat(value) >= 0 && parseFloat(value) <= 100,
                        'Must be between 0 and 100'
                    );
                break;
            case 'EMAIL':
                base = z.string().email('Invalid email address');
                break;
            case 'PHONE_NUMBER':
                base = z.string().regex(/^\+?[\d\s\-()+]+$/, 'Invalid phone number');
                break;
            case 'DATE':
                base = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');
                break;
            case 'DATETIME':
                base = z.string().regex(DATETIME_PATTERN, 'Date-time must be YYYY-MM-DDTHH:mm');
                break;
            case 'BOOLEAN':
                base = z.enum(['true', 'false', '']);
                break;
            case 'TRUE_ONLY':
                base = z.enum(['true', '']);
                break;
            case 'COORDINATE':
                base = z
                    .string()
                    .refine(
                        isValidCoordinateString,
                        'Must be a valid [longitude,latitude] coordinate'
                    );
                break;
            case 'GEOJSON':
                base = z
                    .string()
                    .refine(isValidGeojsonGeometryString, 'Must be valid GeoJSON geometry');
                break;
            case 'ORGANISATION_UNIT':
                base = z.string().length(11, 'Must be a valid organisation unit');
                break;
            case 'FILE_RESOURCE':
            case 'IMAGE':
                base = z.string().uuid('Must be a valid file reference');
                break;
            default:
                base = z.string();
        }
    }

    return config.required ? base : base.optional().or(z.literal(''));
}
