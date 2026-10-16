import { describe, expect, it } from 'vitest';
import { resolveRenderBounds } from './numericBounds';

describe('resolveRenderBounds', () => {
    it.each(['SPINNER', 'SLIDER', 'LINEAR_SCALE'] as const)('returns bounds for %s', (type) => {
        expect(
            resolveRenderBounds({ DESKTOP: { type, min: 1, max: 9, decimalPoints: 2 } })
        ).toEqual({
            min: 1,
            max: 9,
            decimalPoints: 2,
        });
    });

    it('ignores renderings without bounds semantics', () => {
        expect(resolveRenderBounds({ DESKTOP: { type: 'DROPDOWN', min: 1 } })).toBeUndefined();
    });

    it('returns undefined when no bound is configured', () => {
        expect(resolveRenderBounds({ DESKTOP: { type: 'SPINNER' } })).toBeUndefined();
        expect(resolveRenderBounds(undefined)).toBeUndefined();
    });

    it('falls back to MOBILE when DESKTOP is absent', () => {
        expect(resolveRenderBounds({ MOBILE: { type: 'SLIDER', max: 10 } })).toEqual({
            min: undefined,
            max: 10,
            decimalPoints: undefined,
        });
    });
});
