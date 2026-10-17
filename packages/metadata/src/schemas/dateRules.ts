import { z } from 'zod';

const ISO_DATE_LENGTH = 10;

const todayIso = (): string => new Date().toISOString().slice(0, ISO_DATE_LENGTH);

/** Rejects dates (or date-times) after today; empty / non-string values pass through. */
export const rejectFutureDates = (schema: z.ZodTypeAny): z.ZodTypeAny =>
    schema.refine(
        (value) =>
            typeof value !== 'string' ||
            value === '' ||
            value.slice(0, ISO_DATE_LENGTH) <= todayIso(),
        { message: 'Date cannot be in the future' }
    );

export function enrollmentDateSchema(allowFuture: boolean): z.ZodTypeAny {
    const base = z.string().date();
    return allowFuture ? base : rejectFutureDates(base);
}
