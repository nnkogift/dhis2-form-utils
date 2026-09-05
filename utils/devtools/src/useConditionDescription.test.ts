import { describe, expect, it } from 'vitest';
import { parseConditionDescriptionResult } from './useConditionDescription';

describe('parseConditionDescriptionResult', () => {
    it('returns the description on an OK status with non-empty text', () => {
        expect(
            parseConditionDescriptionResult({
                status: 'OK',
                description: 'Age is greater than 120',
            })
        ).toEqual({ description: 'Age is greater than 120', warning: undefined });
    });

    it('ignores an OK status with an empty or whitespace-only description', () => {
        expect(parseConditionDescriptionResult({ status: 'OK', description: '   ' })).toEqual({
            description: undefined,
            warning: undefined,
        });
        expect(parseConditionDescriptionResult({ status: 'OK' })).toEqual({
            description: undefined,
            warning: undefined,
        });
    });

    it('returns the message as a warning on an ERROR status', () => {
        expect(
            parseConditionDescriptionResult({ status: 'ERROR', message: 'Unbalanced parentheses' })
        ).toEqual({ description: undefined, warning: 'Unbalanced parentheses' });
    });

    it('ignores an ERROR status with no message', () => {
        expect(parseConditionDescriptionResult({ status: 'ERROR' })).toEqual({
            description: undefined,
            warning: undefined,
        });
    });

    it('ignores malformed or non-object payloads', () => {
        expect(parseConditionDescriptionResult(undefined)).toEqual({
            description: undefined,
            warning: undefined,
        });
        expect(parseConditionDescriptionResult(null)).toEqual({
            description: undefined,
            warning: undefined,
        });
        expect(parseConditionDescriptionResult('not an object')).toEqual({
            description: undefined,
            warning: undefined,
        });
        expect(parseConditionDescriptionResult({ status: 'UNKNOWN' })).toEqual({
            description: undefined,
            warning: undefined,
        });
    });
});
