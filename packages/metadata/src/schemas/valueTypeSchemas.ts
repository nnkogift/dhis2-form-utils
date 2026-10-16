import type { ValueType } from '@dhis2/api-types/v43';
import { z } from 'zod';
import { isValidCoordinateString, isValidGeojsonGeometryString } from './geoValidators';
import { parseMultiTextValue } from './multiTextValue';

const DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const ORG_UNIT_UID_LENGTH = 11;
const PERCENTAGE_MAX = 100;

/**
 * Base validator for a non-empty string form value of the given value type.
 * Emptiness / required handling lives in `buildFieldSchema`.
 */
// fallow-ignore-next-line complexity
export const valueTypeToStringSchema = (valueType: ValueType | undefined): z.ZodTypeAny => {
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
                    (value) => parseFloat(value) <= PERCENTAGE_MAX,
                    'Must be between 0 and 100'
                );
        case 'EMAIL':
            return z.string().email('Enter a valid email address');
        case 'PHONE_NUMBER':
            return z.string().regex(/^\+?[\d\s\-()+]+$/, 'Enter a valid phone number');
        case 'LETTER':
            return z.string().length(1, 'Must be a single character');
        case 'DATE':
            return z.string().date('Date must be YYYY-MM-DD');
        case 'DATETIME':
            return z.string().regex(DATETIME_PATTERN, 'Date-time must be YYYY-MM-DDTHH:mm');
        case 'BOOLEAN':
            return z.enum(['true', 'false']);
        case 'TRUE_ONLY':
            return z.literal('true');
        case 'ORGANISATION_UNIT':
            return z.string().length(ORG_UNIT_UID_LENGTH, 'Must be a valid organisation unit');
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

export const multiTextOptionSchema = (codes: readonly string[]): z.ZodTypeAny => {
    const codeSet = new Set(codes);
    return z.string().refine(
        (value) => {
            const selected = parseMultiTextValue(value);
            return selected.length > 0 && selected.every((code) => codeSet.has(code));
        },
        { message: 'One or more selected options are invalid' }
    );
};
