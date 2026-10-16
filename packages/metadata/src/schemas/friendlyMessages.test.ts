import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { buildFieldSchema } from './buildFieldSchema';
import { friendlyIssueMessage, withFriendlyMessages } from './friendlyMessages';

const firstMessage = (schema: z.ZodTypeAny, value: unknown): string | undefined =>
    schema.safeParse(value).error?.issues[0]?.message;

describe('friendlyIssueMessage', () => {
    it.each([
        [z.number(), Number.NaN, 'Enter a valid number'],
        [z.number(), undefined, 'This field is required'],
        [z.string(), 42, 'Enter a valid value'],
        [z.enum(['A', 'B']), 'C', 'Select one of the available options'],
        [z.string().email(), 'nope', 'Enter a valid email address'],
        [z.string().min(3), 'ab', 'Must be at least 3 characters'],
        [z.string().max(2), 'abc', 'Must be at most 2 characters'],
        [z.string().length(4), 'abc', 'Must be exactly 4 characters'],
        [z.number().min(5), 1, 'Must be at least 5'],
        [z.number().max(5), 9, 'Must be at most 5'],
        [z.string().date(), 'x', 'Enter a valid date'],
        [
            z.string().length(11, 'Must be a valid organisation unit'),
            'x',
            'Must be a valid organisation unit',
        ],
    ])('rewrites %#', (schema, value, expected) => {
        const issue = schema.safeParse(value).error?.issues[0];
        expect(issue && friendlyIssueMessage(issue)).toBe(expected);
    });
});

describe('withFriendlyMessages', () => {
    it('rewrites default messages and keeps parsed output', () => {
        const schema = withFriendlyMessages(z.coerce.number());
        expect(firstMessage(schema, 'abc')).toBe('Enter a valid number');
        expect(schema.parse('4')).toBe(4);
    });
});

describe('buildFieldSchema messages', () => {
    it.each([
        [{ valueType: 'INTEGER' as const }, 'x', 'Must be a whole number'],
        [{ valueType: 'EMAIL' as const }, 'x', 'Enter a valid email address'],
        [
            { valueType: 'TEXT' as const, optionCodes: ['A'] },
            'Z',
            'Select one of the available options',
        ],
        [{ valueType: 'NUMBER' as const, bounds: { min: 1 } }, '0', 'Must be at least 1'],
        [{ valueType: 'NUMBER' as const, bounds: { max: 5 } }, '9', 'Must be at most 5'],
        [
            { valueType: 'NUMBER' as const, bounds: { decimalPoints: 1 } },
            '1.25',
            'Must have at most 1 decimal places',
        ],
        [{ valueType: 'DATE' as const }, '2024-13-45', 'Date must be YYYY-MM-DD'],
    ])('reports a friendly message for %j', (config, value, expected) => {
        expect(firstMessage(buildFieldSchema({ ...config, required: true }), value)).toBe(expected);
    });

    it('never leaks raw Zod wording', () => {
        const schema = buildFieldSchema({ valueType: 'INTEGER', required: true });
        for (const value of ['abc', Number.NaN, {}, 5.5]) {
            expect(firstMessage(schema, value)).not.toMatch(/Expected|received|Invalid/i);
        }
    });
});
