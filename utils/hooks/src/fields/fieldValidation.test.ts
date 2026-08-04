import { describe, expect, it } from 'vitest';
import { fromProgramStageDataElement } from './fieldConfig';
import { buildFieldSchema } from './fieldValidation';
import { makePsde, makePsdeWithOptionSet } from '../test/fixtures/metadata';

describe('buildFieldSchema', () => {
    it('rejects invalid INTEGER values when required', () => {
        const schema = buildFieldSchema({
            ...fromProgramStageDataElement(makePsde('de-int', 'INTEGER')),
            required: true,
        });
        expect(schema.safeParse('abc').success).toBe(false);
        expect(schema.safeParse('42').success).toBe(true);
    });

    it('allows empty string when optional', () => {
        const schema = buildFieldSchema({
            ...fromProgramStageDataElement(makePsde('de-text', 'TEXT')),
            required: false,
        });
        expect(schema.safeParse('').success).toBe(true);
    });

    it('validates email format', () => {
        const schema = buildFieldSchema({
            ...fromProgramStageDataElement(makePsde('de-email', 'EMAIL')),
            required: true,
        });
        expect(schema.safeParse('not-an-email').success).toBe(false);
        expect(schema.safeParse('user@example.com').success).toBe(true);
    });

    it('validates MULTI_TEXT option-set values as comma-separated codes', () => {
        const schema = buildFieldSchema({
            ...fromProgramStageDataElement(makePsdeWithOptionSet('de-multi', 'MULTI_TEXT')),
            required: true,
        });
        expect(schema.safeParse('YES,NO').success).toBe(true);
        expect(schema.safeParse('YES').success).toBe(true);
        expect(schema.safeParse('YES,UNKNOWN').success).toBe(false);
        expect(schema.safeParse('').success).toBe(false);
    });

    it('validates DATETIME as YYYY-MM-DDTHH:mm', () => {
        const schema = buildFieldSchema({
            ...fromProgramStageDataElement(makePsde('de-dt', 'DATETIME')),
            required: true,
        });
        expect(schema.safeParse('2024-01-15T14:30').success).toBe(true);
        expect(schema.safeParse('2024-01-15T14:30:00Z').success).toBe(false);
        expect(schema.safeParse('2024-01-15').success).toBe(false);
    });
});
