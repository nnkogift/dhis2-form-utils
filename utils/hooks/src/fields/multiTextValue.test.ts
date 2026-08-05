import { describe, expect, it } from 'vitest';
import { joinMultiTextValue, parseMultiTextValue } from './multiTextValue';

describe('multiTextValue re-exports', () => {
    it('parses and joins comma-separated codes', () => {
        expect(parseMultiTextValue('YES, NO')).toEqual(['YES', 'NO']);
        expect(joinMultiTextValue(['YES', 'NO'])).toBe('YES,NO');
    });
});
