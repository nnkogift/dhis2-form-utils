import { describe, expect, it } from 'vitest';
import { buildSchema } from './buildSchema';
import type { ProgramStageMetadata } from './types';

const sampleMetadata = {
    id: 'stage1',
    displayName: 'Sample Stage',
    programStageDataElements: [
        {
            dataElement: { id: 'deText', displayName: 'Name', valueType: 'TEXT' as const },
        },
        {
            dataElement: { id: 'deInt', displayName: 'Age', valueType: 'INTEGER' as const },
        },
        {
            dataElement: { id: 'deBool', displayName: 'Active', valueType: 'BOOLEAN' as const },
        },
    ],
} as ProgramStageMetadata;

describe('buildSchema', () => {
    it('builds a Zod object from program stage metadata', () => {
        const schema = buildSchema(sampleMetadata);
        const result = schema.safeParse({
            deText: 'Alice',
            deInt: 25,
            deBool: true,
        });
        expect(result.success).toBe(true);
    });

    it('rejects invalid value types', () => {
        const schema = buildSchema(sampleMetadata);
        const result = schema.safeParse({
            deText: 'Alice',
            deInt: 'not-a-number',
            deBool: true,
        });
        expect(result.success).toBe(false);
    });
});
