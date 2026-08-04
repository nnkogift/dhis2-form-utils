import { z } from 'zod';
import type { FieldConfig } from './fieldConfig';
import { parseMultiTextValue } from './multiTextValue';

const DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

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
            default:
                base = z.string();
        }
    }

    return config.required ? base : base.optional().or(z.literal(''));
}
