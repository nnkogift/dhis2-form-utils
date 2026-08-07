import type { ValueType } from '@dhis2/api-types/v43';
import { z } from 'zod';
import { parseMultiTextValue } from './multiTextValue';

export type TeaFieldInput = {
    valueType?: ValueType;
    optionSet?: {
        options?: Array<{ code?: string; id?: string }>;
    };
};

const todayIso = (): string => new Date().toISOString().slice(0, 10);
const DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const rejectFutureDates = (schema: z.ZodTypeAny): z.ZodTypeAny =>
    schema.refine((value) => typeof value !== 'string' || value === '' || value <= todayIso(), {
        message: 'Date cannot be in the future',
    });

// Mirrors packages/map/src/coordinateValue.ts's parseCoordinateValue — duplicated here (rather than
// depending on @nnkogift/dhis2-form-utils-map) because packages/metadata is meant to stay usable
// standalone, without pulling in a map-rendering package.
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
    return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
};

const GEOJSON_GEOMETRY_TYPES = new Set([
    'Point',
    'MultiPoint',
    'LineString',
    'MultiLineString',
    'Polygon',
    'MultiPolygon',
    'GeometryCollection',
]);

// fallow-ignore-next-line code-duplication
// Mirrors packages/map/src/geojsonValue.ts's isValidGeojsonGeometry — see the note above
// isValidCoordinateString for why this is duplicated rather than imported.
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

const valueTypeToStringSchema = (valueType: ValueType | undefined): z.ZodTypeAny => {
    switch (valueType) {
        case 'INTEGER':
            return z.string().regex(/^-?\d+$/, 'Must be a whole number');
        case 'INTEGER_POSITIVE':
            return z
                .string()
                .regex(/^\d+$/, 'Must be a positive whole number')
                .refine((value) => parseInt(value, 10) > 0, 'Must be greater than zero');
        case 'INTEGER_NEGATIVE':
            return z
                .string()
                .regex(/^-\d+$/, 'Must be a negative whole number')
                .refine((value) => parseInt(value, 10) < 0, 'Must be less than zero');
        case 'INTEGER_ZERO_OR_POSITIVE':
            return z
                .string()
                .regex(/^\d+$/, 'Must be zero or a positive whole number')
                .refine((value) => parseInt(value, 10) >= 0, 'Must be zero or greater');
        case 'NUMBER':
        case 'UNIT_INTERVAL':
            return z.string().regex(/^-?\d+(\.\d+)?$/, 'Must be a number');
        case 'PERCENTAGE':
            return z
                .string()
                .regex(/^\d+(\.\d+)?$/, 'Must be a number')
                .refine(
                    (value) => parseFloat(value) >= 0 && parseFloat(value) <= 100,
                    'Must be between 0 and 100'
                );
        case 'EMAIL':
            return z.string().email('Invalid email address');
        case 'PHONE_NUMBER':
            return z.string().regex(/^\+?[\d\s\-()+]+$/, 'Invalid phone number');
        case 'DATE':
            return z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');
        case 'DATETIME':
            return z.string().regex(DATETIME_PATTERN, 'Date-time must be YYYY-MM-DDTHH:mm');
        case 'BOOLEAN':
            return z.enum(['true', 'false', '']);
        case 'TRUE_ONLY':
            return z.enum(['true', '']);
        case 'ORGANISATION_UNIT':
            return z.string().min(11).max(11);
        case 'COORDINATE':
            return z
                .string()
                .refine(isValidCoordinateString, 'Must be a valid [longitude,latitude] coordinate');
        case 'GEOJSON':
            return z
                .string()
                .refine(isValidGeojsonGeometryString, 'Must be valid GeoJSON geometry');
        case 'FILE_RESOURCE':
        case 'IMAGE':
            return z.string().uuid('Must be a valid file reference');
        default:
            return z.string();
    }
};

/**
 * Per-TEA Zod schema for tracker registration forms.
 * Form values are stored as strings in RHF.
 */
export function buildTeaFieldSchema(
    tea: TeaFieldInput,
    mandatory: boolean,
    allowFutureDate = true
): z.ZodTypeAny {
    const codes =
        tea.optionSet?.options
            ?.map((option) => option.code ?? option.id)
            .filter((code): code is string => Boolean(code)) ?? [];

    let base: z.ZodTypeAny;

    if (codes.length > 0) {
        base =
            tea.valueType === 'MULTI_TEXT'
                ? multiTextOptionSchema(codes)
                : z.enum(codes as [string, ...string[]]);
    } else {
        base = valueTypeToStringSchema(tea.valueType);
    }

    if (!allowFutureDate && (tea.valueType === 'DATE' || tea.valueType === 'DATETIME')) {
        base = rejectFutureDates(base);
    }

    if (mandatory) {
        return base.refine((value) => value !== '' && value != null, 'Required');
    }

    return base.optional().or(z.literal(''));
}

export function enrollmentDateSchema(allowFuture: boolean): z.ZodTypeAny {
    const base = z.string().date();
    return allowFuture ? base : rejectFutureDates(base);
}
