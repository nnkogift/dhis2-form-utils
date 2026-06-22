import { describe, expect, it } from 'vitest';
import { fromProgramStageDataElement } from './fieldConfig';
import { buildFieldSchema } from './fieldValidation';
import { makePsde } from '../test/fixtures/metadata';

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
});
