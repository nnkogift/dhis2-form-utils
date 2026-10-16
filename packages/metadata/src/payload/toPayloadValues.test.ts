import { describe, expect, it } from 'vitest';
import { buildSchema } from '../schemas/buildSchema';
import type { ProgramStageMetadata } from '../domain/types';
import { toPayloadValues } from './toPayloadValues';

describe('toPayloadValues', () => {
    it('stringifies numbers and booleans and drops empty values', () => {
        expect(
            toPayloadValues({ a: 42, b: 1.5, c: true, d: false, e: 'text', f: undefined, g: null })
        ).toEqual({ a: '42', b: '1.5', c: 'true', d: 'false', e: 'text' });
    });

    it('rejects non-primitive values', () => {
        expect(() => toPayloadValues({ a: { nested: true } })).toThrow(TypeError);
    });

    it('round-trips schema output back to the original form strings', () => {
        const metadata = {
            id: 'stage',
            programStageDataElements: [
                { dataElement: { id: 'int', valueType: 'INTEGER' } },
                { dataElement: { id: 'bool', valueType: 'BOOLEAN' } },
                { dataElement: { id: 'text', valueType: 'TEXT' } },
                { dataElement: { id: 'empty', valueType: 'NUMBER' } },
            ],
        } as ProgramStageMetadata;
        const formValues = { int: '7', bool: 'false', text: 'hi', empty: '' };

        const parsed = buildSchema(metadata).parse(formValues);

        expect(toPayloadValues(parsed)).toEqual({ int: '7', bool: 'false', text: 'hi' });
    });
});
