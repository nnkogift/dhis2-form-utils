import { describe, expect, it } from 'vitest';
import { buildFieldSchema } from './buildFieldSchema';

const tomorrow = (): string => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + 1);
    return date.toISOString().slice(0, 10);
};

describe('buildFieldSchema', () => {
    describe('required handling', () => {
        it('reports "Required" (not a type error) for an empty required value', () => {
            const result = buildFieldSchema({ valueType: 'INTEGER', required: true }).safeParse('');
            expect(result.success).toBe(false);
            expect(result.error?.issues.map((issue) => issue.message)).toEqual(['Required']);
        });

        it.each(['', undefined, null])('treats %s as empty', (value) => {
            expect(
                buildFieldSchema({ valueType: 'TEXT', required: true }).safeParse(value).success
            ).toBe(false);
            const optional = buildFieldSchema({ valueType: 'TEXT', required: false }).safeParse(
                value
            );
            expect(optional.success).toBe(true);
            expect(optional.data).toBeUndefined();
        });
    });

    describe('typed output', () => {
        it.each([
            ['INTEGER', '42', 42],
            ['INTEGER_NEGATIVE', '-3', -3],
            ['NUMBER', '1.5', 1.5],
            ['PERCENTAGE', '99.5', 99.5],
            ['BOOLEAN', 'true', true],
            ['BOOLEAN', 'false', false],
            ['TRUE_ONLY', 'true', true],
            ['TEXT', 'hello', 'hello'],
            ['DATE', '2024-01-15', '2024-01-15'],
        ] as const)('parses %s "%s" to %j', (valueType, input, expected) => {
            const result = buildFieldSchema({ valueType, required: true }).safeParse(input);
            expect(result.success).toBe(true);
            expect(result.data).toBe(expected);
        });

        it('keeps an optional empty number undefined instead of coercing to 0', () => {
            const result = buildFieldSchema({ valueType: 'NUMBER', required: false }).safeParse('');
            expect(result.data).toBeUndefined();
        });
    });

    describe('value type validation', () => {
        it('validates COORDINATE as a [lng,lat] string', () => {
            const schema = buildFieldSchema({ valueType: 'COORDINATE', required: true });
            expect(schema.safeParse('[35.703,-5.639]').success).toBe(true);
            expect(schema.safeParse('[200,-5.639]').success).toBe(false);
            expect(schema.safeParse('not-json').success).toBe(false);
        });

        it('validates GEOJSON as a geometry JSON string', () => {
            const schema = buildFieldSchema({ valueType: 'GEOJSON', required: true });
            expect(schema.safeParse('{"type":"Point","coordinates":[0,0]}').success).toBe(true);
            expect(schema.safeParse('{"type":"Feature"}').success).toBe(false);
        });

        it('validates ORGANISATION_UNIT as an 11-char uid', () => {
            const schema = buildFieldSchema({ valueType: 'ORGANISATION_UNIT', required: true });
            expect(schema.safeParse('abcdefghijk').success).toBe(true);
            expect(schema.safeParse('short').success).toBe(false);
        });

        it.each(['FILE_RESOURCE', 'IMAGE'] as const)('validates %s as a UUID', (valueType) => {
            const schema = buildFieldSchema({ valueType, required: true });
            expect(schema.safeParse('550e8400-e29b-41d4-a716-446655440000').success).toBe(true);
            expect(schema.safeParse('not-a-uuid').success).toBe(false);
        });

        it('accepts DATETIME as YYYY-MM-DDTHH:mm and rejects a date-only value', () => {
            const schema = buildFieldSchema({ valueType: 'DATETIME', required: true });
            expect(schema.safeParse('2024-01-15T14:30').success).toBe(true);
            expect(schema.safeParse('2024-01-15').success).toBe(false);
        });

        it('rejects an impossible calendar DATE', () => {
            const schema = buildFieldSchema({ valueType: 'DATE', required: true });
            expect(schema.safeParse('2024-13-45').success).toBe(false);
        });

        it('validates LETTER as a single character', () => {
            const schema = buildFieldSchema({ valueType: 'LETTER', required: true });
            expect(schema.safeParse('a').success).toBe(true);
            expect(schema.safeParse('ab').success).toBe(false);
        });
    });

    describe('allowFutureDate', () => {
        it.each([
            ['DATE', tomorrow()],
            ['DATETIME', `${tomorrow()}T10:00`],
        ] as const)('rejects a future %s when not allowed', (valueType, future) => {
            const schema = buildFieldSchema({ valueType, required: true, allowFutureDate: false });
            expect(schema.safeParse(future).success).toBe(false);
        });

        it('accepts a future date by default', () => {
            const schema = buildFieldSchema({ valueType: 'DATE', required: true });
            expect(schema.safeParse(tomorrow()).success).toBe(true);
        });

        it('accepts today when future dates are not allowed', () => {
            const today = new Date().toISOString().slice(0, 10);
            const schema = buildFieldSchema({
                valueType: 'DATE',
                required: true,
                allowFutureDate: false,
            });
            expect(schema.safeParse(today).success).toBe(true);
        });
    });

    describe('option sets', () => {
        it('accepts only listed option codes', () => {
            const schema = buildFieldSchema({
                valueType: 'TEXT',
                required: true,
                optionCodes: ['A', 'B'],
            });
            expect(schema.safeParse('A').success).toBe(true);
            expect(schema.safeParse('C').success).toBe(false);
        });

        it('validates MULTI_TEXT as comma-separated listed codes', () => {
            const schema = buildFieldSchema({
                valueType: 'MULTI_TEXT',
                required: true,
                optionCodes: ['YES', 'NO'],
            });
            expect(schema.safeParse('YES,NO').success).toBe(true);
            expect(schema.safeParse('YES,UNKNOWN').success).toBe(false);
        });

        it('allows an empty value when optional', () => {
            const schema = buildFieldSchema({
                valueType: 'TEXT',
                required: false,
                optionCodes: ['A'],
            });
            expect(schema.safeParse('').success).toBe(true);
        });
    });

    describe('numeric bounds', () => {
        const schema = buildFieldSchema({
            valueType: 'NUMBER',
            required: true,
            bounds: { min: 1, max: 5, decimalPoints: 1 },
        });

        it('enforces min and max', () => {
            expect(schema.safeParse('3').success).toBe(true);
            expect(schema.safeParse('0').success).toBe(false);
            expect(schema.safeParse('6').success).toBe(false);
        });

        it('enforces decimal places', () => {
            expect(schema.safeParse('2.5').success).toBe(true);
            expect(schema.safeParse('2.55').success).toBe(false);
        });

        it('ignores bounds on non-numeric value types', () => {
            const text = buildFieldSchema({
                valueType: 'TEXT',
                required: true,
                bounds: { min: 100 },
            });
            expect(text.safeParse('5').success).toBe(true);
        });
    });
});
