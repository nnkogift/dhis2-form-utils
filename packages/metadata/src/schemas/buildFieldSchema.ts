import type { ValueType } from '@dhis2/api-types/v43';
import { z } from 'zod';
import { translate } from '../i18n/translate';
import { rejectFutureDates } from './dateRules';
import { withFriendlyMessages } from './friendlyMessages';
import { applyNumericBounds, type NumericBounds } from './numericBounds';
import { isDateValueType, isNumericValueType, toTypedValue } from './valueTypeCategories';
import { multiTextOptionSchema, valueTypeToStringSchema } from './valueTypeSchemas';

const REQUIRED_MESSAGE = 'Required';

/** Normalized field configuration, independent of the entity (data element / TEA) it came from. */
export type FieldSchemaInput = {
    valueType?: ValueType;
    required: boolean;
    allowFutureDate?: boolean;
    optionCodes?: readonly string[];
    bounds?: NumericBounds;
};

const isEmpty = (value: unknown): value is '' | null | undefined =>
    value === undefined || value === null || value === '';

const buildBaseSchema = ({
    valueType,
    allowFutureDate = true,
    optionCodes = [],
    bounds,
}: FieldSchemaInput): z.ZodTypeAny => {
    if (optionCodes.length > 0) {
        return valueType === 'MULTI_TEXT'
            ? multiTextOptionSchema(optionCodes)
            : z.enum(optionCodes as [string, ...string[]]);
    }

    let base = valueTypeToStringSchema(valueType);
    if (isNumericValueType(valueType)) base = applyNumericBounds(base, bounds);
    if (!allowFutureDate && isDateValueType(valueType)) base = rejectFutureDates(base);
    return base;
};

/**
 * Per-field Zod schema. Input is the flat string held in React Hook Form; output is the
 * value in its specific type (number / boolean / string), or `undefined` when empty.
 * Issues carry human-friendly, translated messages (see `friendlyIssueMessage`).
 * Use `toPayloadValues` to turn the parsed output back into DHIS2 payload strings.
 */
export function buildFieldSchema(input: FieldSchemaInput): z.ZodTypeAny {
    const base = withFriendlyMessages(buildBaseSchema(input));

    return z.unknown().transform((value, ctx) => {
        if (isEmpty(value)) {
            if (input.required) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: translate(REQUIRED_MESSAGE) });
                return z.NEVER;
            }
            return undefined;
        }
        const result = base.safeParse(value);
        if (!result.success) {
            for (const issue of result.error.issues) ctx.addIssue(issue);
            return z.NEVER;
        }
        return toTypedValue(input.valueType, result.data as string);
    });
}
