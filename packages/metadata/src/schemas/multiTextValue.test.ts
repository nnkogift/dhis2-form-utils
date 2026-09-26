import { describe, expect, it } from 'vitest';
import { joinMultiTextValue, parseMultiTextValue } from './multiTextValue';

describe('parseMultiTextValue', () => {
    it('returns an empty array for an empty string', () => {
        expect(parseMultiTextValue('')).toEqual([]);
    });

    it('splits comma-separated codes and trims whitespace', () => {
        expect(parseMultiTextValue('YES, NO ,MAYBE')).toEqual(['YES', 'NO', 'MAYBE']);
    });

    it('drops empty tokens', () => {
        expect(parseMultiTextValue('YES,,NO,')).toEqual(['YES', 'NO']);
    });
});

describe('joinMultiTextValue', () => {
    it('joins codes with commas', () => {
        expect(joinMultiTextValue(['YES', 'NO'])).toBe('YES,NO');
    });

    it('returns an empty string for an empty list', () => {
        expect(joinMultiTextValue([])).toBe('');
    });

    it('drops empty codes', () => {
        expect(joinMultiTextValue(['YES', '', 'NO'])).toBe('YES,NO');
    });
});
