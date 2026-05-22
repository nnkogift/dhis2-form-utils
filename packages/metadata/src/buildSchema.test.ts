import { describe, expect, it } from 'vitest';
import { buildSchema } from './buildSchema';
import type { ProgramStageMetadata } from './types';

const sampleMetadata: ProgramStageMetadata = {
  id: 'stage1',
  displayName: 'Sample Stage',
  programStageDataElements: [
    {
      dataElement: { id: 'deText', displayName: 'Name', valueType: 'TEXT' },
    },
    {
      dataElement: { id: 'deInt', displayName: 'Age', valueType: 'INTEGER' },
    },
    {
      dataElement: { id: 'deBool', displayName: 'Active', valueType: 'BOOLEAN' },
    },
  ],
};

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
