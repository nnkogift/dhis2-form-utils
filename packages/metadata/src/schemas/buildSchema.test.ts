import { describe, expect, it } from 'vitest';
import { buildSchema } from './buildSchema';
import type { ProgramStageMetadata } from '../domain/types';

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
            deInt: '25',
            deBool: 'true',
        });
        expect(result.success).toBe(true);
        expect(result.data).toEqual({ deText: 'Alice', deInt: 25, deBool: true });
    });

    it('rejects invalid value types', () => {
        const schema = buildSchema(sampleMetadata);
        const result = schema.safeParse({
            deText: 'Alice',
            deInt: 'not-a-number',
            deBool: 'true',
        });
        expect(result.success).toBe(false);
    });

    it('enforces compulsory data elements', () => {
        const schema = buildSchema({
            id: 'stage',
            programStageDataElements: [
                { compulsory: true, dataElement: { id: 'req', valueType: 'TEXT' } },
                { compulsory: false, dataElement: { id: 'opt', valueType: 'TEXT' } },
            ],
        });

        expect(schema.safeParse({ req: '', opt: '' }).success).toBe(false);
        expect(schema.safeParse({ req: 'x', opt: '' }).success).toBe(true);
    });

    it('enforces allowFutureDate', () => {
        const schema = buildSchema({
            id: 'stage',
            programStageDataElements: [
                { allowFutureDate: false, dataElement: { id: 'when', valueType: 'DATE' } },
            ],
        });

        expect(schema.safeParse({ when: '2999-01-01' }).success).toBe(false);
        expect(schema.safeParse({ when: '2000-01-01' }).success).toBe(true);
    });

    it('restricts values to the option set codes', () => {
        const schema = buildSchema({
            id: 'stage',
            programStageDataElements: [
                {
                    dataElement: {
                        id: 'choice',
                        valueType: 'TEXT',
                        optionSet: { id: 'os', options: [{ id: 'o1', code: 'A' }] },
                    },
                },
            ],
        } as unknown as ProgramStageMetadata);

        expect(schema.safeParse({ choice: 'A' }).success).toBe(true);
        expect(schema.safeParse({ choice: 'Z' }).success).toBe(false);
    });

    it('applies numeric bounds from a spinner rendering', () => {
        const schema = buildSchema({
            id: 'stage',
            programStageDataElements: [
                {
                    renderType: { DESKTOP: { type: 'SPINNER', min: 1, max: 5 } },
                    dataElement: { id: 'score', valueType: 'INTEGER' },
                },
            ],
        });

        expect(schema.safeParse({ score: '3' }).success).toBe(true);
        expect(schema.safeParse({ score: '9' }).success).toBe(false);
    });

    it('keeps a boolean "false" as false', () => {
        const schema = buildSchema(sampleMetadata);
        expect(schema.parse({ deText: 'a', deInt: '1', deBool: 'false' }).deBool).toBe(false);
    });
});
