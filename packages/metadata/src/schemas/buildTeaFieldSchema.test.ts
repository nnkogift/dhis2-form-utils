import { describe, expect, it } from 'vitest';
import { buildTeaFieldSchema } from './buildTeaFieldSchema';

describe('buildTeaFieldSchema', () => {
    it('validates COORDINATE as a [lng,lat] string', () => {
        const schema = buildTeaFieldSchema({ valueType: 'COORDINATE' }, true);
        expect(schema.safeParse('[35.703,-5.639]').success).toBe(true);
        expect(schema.safeParse('[200,-5.639]').success).toBe(false);
        expect(schema.safeParse('not-json').success).toBe(false);
    });

    it('validates GEOJSON as a geometry JSON string', () => {
        const schema = buildTeaFieldSchema({ valueType: 'GEOJSON' }, true);
        expect(schema.safeParse('{"type":"Point","coordinates":[0,0]}').success).toBe(true);
        expect(schema.safeParse('{"type":"Feature"}').success).toBe(false);
        expect(schema.safeParse('not-json').success).toBe(false);
    });

    it('validates ORGANISATION_UNIT as an 11-char uid', () => {
        const schema = buildTeaFieldSchema({ valueType: 'ORGANISATION_UNIT' }, true);
        expect(schema.safeParse('abcdefghijk').success).toBe(true);
        expect(schema.safeParse('short').success).toBe(false);
    });

    it.each(['FILE_RESOURCE', 'IMAGE'] as const)('validates %s as a UUID string', (valueType) => {
        const schema = buildTeaFieldSchema({ valueType }, true);
        expect(schema.safeParse('550e8400-e29b-41d4-a716-446655440000').success).toBe(true);
        expect(schema.safeParse('not-a-uuid').success).toBe(false);
    });

    it('allows empty string when not mandatory', () => {
        const schema = buildTeaFieldSchema({ valueType: 'COORDINATE' }, false);
        expect(schema.safeParse('').success).toBe(true);
    });
});
