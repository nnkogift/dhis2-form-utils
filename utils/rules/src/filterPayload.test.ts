import { describe, expect, it } from 'vitest';
import { filterPayload } from './filterPayload';
import { createEmptyFieldState, type FieldStateMap } from './types';

describe('filterPayload', () => {
    it('passes through values for keys with no field state', () => {
        expect(filterPayload({ de1: 'value' }, {})).toEqual({ de1: 'value' });
    });

    it('drops hidden fields', () => {
        const fieldState: FieldStateMap = { de1: { ...createEmptyFieldState(), hidden: true } };

        expect(filterPayload({ de1: 'value' }, fieldState)).toEqual({});
    });

    it('substitutes an assigned value over the raw value', () => {
        const fieldState: FieldStateMap = {
            de1: { ...createEmptyFieldState(), assignedValue: 'assigned' },
        };

        expect(filterPayload({ de1: 'raw' }, fieldState)).toEqual({ de1: 'assigned' });
    });

    it('nulls out a value matching a directly hidden option code', () => {
        const fieldState: FieldStateMap = {
            de1: { ...createEmptyFieldState(), hiddenOptions: new Set(['opt1']) },
        };

        expect(filterPayload({ de1: 'opt1' }, fieldState)).toEqual({ de1: null });
    });

    it('nulls out a value matching a hidden option-group member, given optionGroups', () => {
        const fieldState: FieldStateMap = {
            de1: { ...createEmptyFieldState(), hiddenOptionGroups: new Set(['og1']) },
        };
        const optionGroups = { og1: ['opt1', 'opt2'] };

        expect(filterPayload({ de1: 'opt2' }, fieldState, optionGroups)).toEqual({ de1: null });
    });

    it('passes through a visible option value unchanged', () => {
        const fieldState: FieldStateMap = {
            de1: { ...createEmptyFieldState(), hiddenOptions: new Set(['opt1']) },
        };

        expect(filterPayload({ de1: 'opt2' }, fieldState)).toEqual({ de1: 'opt2' });
    });

    it('strips hidden codes from a comma-separated MULTI_TEXT value', () => {
        const fieldState: FieldStateMap = {
            de1: { ...createEmptyFieldState(), hiddenOptions: new Set(['opt1']) },
        };

        expect(filterPayload({ de1: 'opt1,opt2,opt3' }, fieldState)).toEqual({
            de1: 'opt2,opt3',
        });
    });

    it('nulls a MULTI_TEXT value when every code is hidden', () => {
        const fieldState: FieldStateMap = {
            de1: { ...createEmptyFieldState(), hiddenOptions: new Set(['opt1', 'opt2']) },
        };

        expect(filterPayload({ de1: 'opt1,opt2' }, fieldState)).toEqual({ de1: null });
    });

    it('only guards against directly hidden options when optionGroups is omitted', () => {
        const fieldState: FieldStateMap = {
            de1: { ...createEmptyFieldState(), hiddenOptionGroups: new Set(['og1']) },
        };

        expect(filterPayload({ de1: 'opt2' }, fieldState)).toEqual({ de1: 'opt2' });
    });
});
