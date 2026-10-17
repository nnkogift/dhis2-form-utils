import { z } from 'zod';
import { translate, type TranslateVariables } from '../i18n/translate';

/** Params carried on custom issues so the message can be translated (and interpolated) at validation time. */
export type FriendlyIssueParams = { vars?: TranslateVariables };

/** `refine` options for a message key with `{{placeholders}}`, translated when validation runs. */
export const messageWithVars = (
    message: string,
    vars: TranslateVariables
): { message: string; params: FriendlyIssueParams } => ({ message, params: { vars } });

const isFriendlyParams = (params: unknown): params is FriendlyIssueParams =>
    typeof params === 'object' && params !== null;

const isDefaultZodMessage = (issue: z.ZodIssue): boolean =>
    issue.message === z.defaultErrorMap(issue, { data: undefined, defaultError: '' }).message;

const stringLengthMessage = (issue: z.ZodIssue & { code: 'too_small' | 'too_big' }): string => {
    const count = Number(issue.code === 'too_small' ? issue.minimum : issue.maximum);
    if (issue.exact) return translate('Must be exactly {{count}} characters', { count });
    return issue.code === 'too_small'
        ? translate('Must be at least {{count}} characters', { count })
        : translate('Must be at most {{count}} characters', { count });
};

const numberRangeMessage = (issue: z.ZodIssue & { code: 'too_small' | 'too_big' }): string =>
    issue.code === 'too_small'
        ? translate('Must be at least {{min}}', { min: Number(issue.minimum) })
        : translate('Must be at most {{max}}', { max: Number(issue.maximum) });

const invalidStringMessage = (validation: unknown): string => {
    if (validation === 'email') return translate('Enter a valid email address');
    if (validation === 'uuid') return translate('Must be a valid file reference');
    if (validation === 'date' || validation === 'datetime') return translate('Enter a valid date');
    return translate('Enter a valid value');
};

const invalidTypeMessage = (received: string): string => {
    if (received === 'nan') return translate('Enter a valid number');
    if (received === 'undefined' || received === 'null') return translate('This field is required');
    return translate('Enter a valid value');
};

/** Turns a Zod issue into a short, human-friendly, translated message. */
export function friendlyIssueMessage(issue: z.ZodIssue): string {
    if (issue.code === 'custom') {
        const vars = isFriendlyParams(issue.params) ? issue.params.vars : undefined;
        return translate(issue.message, vars);
    }
    // A message we supplied ourselves (e.g. `.length(11, 'Must be a valid organisation unit')`).
    if (!isDefaultZodMessage(issue)) return translate(issue.message);

    switch (issue.code) {
        case 'invalid_type':
            return invalidTypeMessage(issue.received);
        case 'invalid_enum_value':
            return translate('Select one of the available options');
        case 'invalid_string':
            return invalidStringMessage(issue.validation);
        case 'invalid_date':
            return translate('Enter a valid date');
        case 'too_small':
        case 'too_big':
            return issue.type === 'string' ? stringLengthMessage(issue) : numberRangeMessage(issue);
        case 'not_finite':
            return translate('Enter a valid number');
        default:
            return translate('Enter a valid value');
    }
}

/**
 * Wraps a schema so every issue it reports is rewritten into a friendly, translated message.
 * Translation happens at validation time, so a locale change after the schema was built still applies.
 * The wrapped schema's parsed output is returned unchanged.
 */
export function withFriendlyMessages(schema: z.ZodTypeAny): z.ZodTypeAny {
    return z.unknown().transform((value, ctx) => {
        const result = schema.safeParse(value);
        if (result.success) return result.data as unknown;
        for (const issue of result.error.issues) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: friendlyIssueMessage(issue) });
        }
        return z.NEVER;
    });
}
