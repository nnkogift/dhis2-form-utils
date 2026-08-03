import { describe, expect, it } from 'vitest';
import { resolveHiddenOptionCodes } from './resolveHiddenOptionCodes';
import { createEmptyFieldState } from './types';

describe('resolveHiddenOptionCodes', () => {
    it('returns directly hidden option codes', () => {
        const state = { ...createEmptyFieldState(), hiddenOptions: new Set(['opt1']) };

        expect(resolveHiddenOptionCodes(state)).toEqual(new Set(['opt1']));
    });

    it('expands hidden option groups into their member codes', () => {
        const state = {
            ...createEmptyFieldState(),
            hiddenOptionGroups: new Set(['og1']),
        };
        const optionGroups = { og1: ['A', 'B'] };

        expect(resolveHiddenOptionCodes(state, optionGroups)).toEqual(new Set(['A', 'B']));
    });

    it('unions directly hidden options with hidden group members', () => {
        const state = {
            ...createEmptyFieldState(),
            hiddenOptions: new Set(['opt1']),
            hiddenOptionGroups: new Set(['og1']),
        };
        const optionGroups = { og1: ['A', 'B'] };

        expect(resolveHiddenOptionCodes(state, optionGroups)).toEqual(new Set(['opt1', 'A', 'B']));
    });

    it('degrades gracefully when optionGroups is omitted or missing the referenced id', () => {
        const state = {
            ...createEmptyFieldState(),
            hiddenOptionGroups: new Set(['og1']),
        };

        expect(resolveHiddenOptionCodes(state)).toEqual(new Set());
        expect(resolveHiddenOptionCodes(state, { otherGroup: ['A'] })).toEqual(new Set());
    });

    it('returns an empty set when nothing is hidden', () => {
        expect(resolveHiddenOptionCodes(createEmptyFieldState())).toEqual(new Set());
    });
});
