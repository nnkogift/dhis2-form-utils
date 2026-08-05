import { describe, expect, it } from 'vitest';
import { computeAgeFromDob } from './computeAgeFromDob';

describe('computeAgeFromDob', () => {
    it('returns empty string for invalid dates', () => {
        expect(computeAgeFromDob('')).toBe('');
        expect(computeAgeFromDob('not-a-date')).toBe('');
    });

    it('computes whole years from a date of birth', () => {
        expect(computeAgeFromDob('2000-01-01')).toMatch(/^\d+$/);
        expect(Number(computeAgeFromDob('2000-01-01'))).toBeGreaterThan(0);
    });
});
