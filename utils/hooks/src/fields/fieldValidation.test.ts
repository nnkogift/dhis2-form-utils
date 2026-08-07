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

    it('validates COORDINATE as a [lng,lat] string', () => {
        const schema = buildFieldSchema({
            ...fromProgramStageDataElement(makePsde('de-coord', 'COORDINATE')),
            required: true,
        });
        expect(schema.safeParse('[35.703,-5.639]').success).toBe(true);
        expect(schema.safeParse('[200,-5.639]').success).toBe(false);
        expect(schema.safeParse('not-json').success).toBe(false);
    });

    it('validates GEOJSON as a geometry JSON string', () => {
        const schema = buildFieldSchema({
            ...fromProgramStageDataElement(makePsde('de-geo', 'GEOJSON')),
            required: true,
        });
        expect(schema.safeParse('{"type":"Point","coordinates":[0,0]}').success).toBe(true);
        expect(schema.safeParse('{"type":"Feature"}').success).toBe(false);
        expect(schema.safeParse('not-json').success).toBe(false);
    });

    it('validates ORGANISATION_UNIT as an 11-char uid', () => {
        const schema = buildFieldSchema({
            ...fromProgramStageDataElement(makePsde('de-ou', 'ORGANISATION_UNIT')),
            required: true,
        });
        expect(schema.safeParse('abcdefghijk').success).toBe(true);
        expect(schema.safeParse('short').success).toBe(false);
    });

    it.each(['FILE_RESOURCE', 'IMAGE'] as const)('validates %s as a UUID string', (valueType) => {
        const schema = buildFieldSchema({
            ...fromProgramStageDataElement(makePsde('de-file', valueType)),
            required: true,
        });
        expect(schema.safeParse('550e8400-e29b-41d4-a716-446655440000').success).toBe(true);
        expect(schema.safeParse('not-a-uuid').success).toBe(false);
    });
});
