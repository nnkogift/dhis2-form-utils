import type { ValueType } from '@dhis2/api-types/v43';
import { z } from 'zod';

export type TeaFieldInput = {
    valueType?: ValueType;
    optionSet?: {
        options?: Array<{ code?: string; id?: string }>;
    };
};

const todayIso = (): string => new Date().toISOString().slice(0, 10);

const rejectFutureDates = (schema: z.ZodTypeAny): z.ZodTypeAny =>
    schema.refine((value) => typeof value !== 'string' || value === '' || value <= todayIso(), {
        message: 'Date cannot be in the future',
    });

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
            return z.string().datetime({ message: 'Invalid date-time' });
        case 'BOOLEAN':
            return z.enum(['true', 'false', '']);
        case 'TRUE_ONLY':
            return z.enum(['true', '']);
        case 'ORGANISATION_UNIT':
            return z.string().min(11).max(11);
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
        base = z.enum(codes as [string, ...string[]]);
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
