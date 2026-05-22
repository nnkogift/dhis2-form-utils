import { describe, expect, it } from 'vitest';
import { applyEffect, evaluateAndMap } from './evaluate';
import { createEmptyFieldState } from './types';

describe('applyEffect', () => {
    it('hides a field on HIDEFIELD', () => {
        const state = applyEffect(
            {},
            {
                ruleActionType: 'HIDEFIELD',
                dataElement: 'de1',
            }
        );
        expect(state.de1.hidden).toBe(true);
    });

    it('sets mandatory and warning', () => {
        let state = applyEffect(
            {},
            {
                ruleActionType: 'SETMANDATORYFIELD',
                dataElement: 'de1',
            }
        );
        state = applyEffect(state, {
            ruleActionType: 'SHOWWARNING',
            dataElement: 'de1',
            content: 'Check value',
        });
        expect(state.de1.mandatory).toBe(true);
        expect(state.de1.warning).toBe('Check value');
    });
});

describe('evaluateAndMap', () => {
    it('folds multiple effects into field state', () => {
        const engine = {
            evaluate: () => [
                { ruleActionType: 'HIDEFIELD', dataElement: 'hiddenField' },
                { ruleActionType: 'SETMANDATORYFIELD', dataElement: 'requiredField' },
                { ruleActionType: 'ASSIGN', dataElement: 'assignedField', data: 'auto' },
            ],
        };

        const result = evaluateAndMap(engine, {
            hiddenField: 'x',
            requiredField: '',
            assignedField: '',
        });

        expect(result.hiddenField.hidden).toBe(true);
        expect(result.requiredField.mandatory).toBe(true);
        expect(result.assignedField.assignedValue).toBe('auto');
    });

    it('supports custom effect handlers', () => {
        const engine = {
            evaluate: () => [{ ruleActionType: 'CUSTOM', dataElement: 'de1' }],
        };

        const result = evaluateAndMap(
            engine,
            {},
            {
                CUSTOM: (effect, state) => {
                    const key = effect.dataElement ?? '';
                    return {
                        ...state,
                        [key]: { ...createEmptyFieldState(), warning: 'custom' },
                    };
                },
            }
        );

        expect(result.de1.warning).toBe('custom');
    });
});

describe('filterPayload', () => {
    it('strips hidden fields and applies assigned values', async () => {
        const { filterPayload } = await import('./filterPayload');

        const values = { a: '1', b: '2', c: '3' };
        const fieldState = {
            a: { ...createEmptyFieldState(), hidden: true },
            b: { ...createEmptyFieldState(), assignedValue: 'assigned' },
            c: createEmptyFieldState(),
        };

        expect(filterPayload(values, fieldState)).toEqual({ b: 'assigned', c: '3' });
    });
});
