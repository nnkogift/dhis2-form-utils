import { ProgramRuleActionType } from '@dhis2-form-utils/metadata';
import { describe, expect, it } from 'vitest';
import { applyEffect, evaluateAndMap } from './evaluate';
import { createEmptyFieldState } from './types';

describe('applyEffect', () => {
    it('hides a field on HIDEFIELD', () => {
        const state = applyEffect(
            {},
            {
                ruleActionType: ProgramRuleActionType.HIDEFIELD,
                dataElement: 'de1',
            }
        );
        expect(state.de1.hidden).toBe(true);
    });

    it('sets mandatory and warning', () => {
        let state = applyEffect(
            {},
            {
                ruleActionType: ProgramRuleActionType.SETMANDATORYFIELD,
                dataElement: 'de1',
            }
        );
        state = applyEffect(state, {
            ruleActionType: ProgramRuleActionType.SHOWWARNING,
            dataElement: 'de1',
            content: 'Check value',
        });
        expect(state.de1.mandatory).toBe(true);
        expect(state.de1.warning).toBe('Check value');
    });

    it('applies option and section visibility effects', () => {
        let state = applyEffect(
            {},
            {
                ruleActionType: ProgramRuleActionType.HIDEOPTION,
                dataElement: 'de1',
                optionCode: 'opt1',
            }
        );

        state = applyEffect(state, {
            ruleActionType: ProgramRuleActionType.SHOWOPTION,
            dataElement: 'de1',
            optionCode: 'opt1',
        });

        state = applyEffect(state, {
            ruleActionType: ProgramRuleActionType.HIDEOPTIONGROUP,
            dataElement: 'de1',
            optionGroupId: 'og1',
        });

        state = applyEffect(state, {
            ruleActionType: ProgramRuleActionType.SHOWOPTIONGROUP,
            dataElement: 'de1',
            optionGroupId: 'og1',
        });

        state = applyEffect(state, {
            ruleActionType: ProgramRuleActionType.HIDESECTION,
            programStageSection: 'section-a',
        });

        expect(state.de1.hiddenOptions.size).toBe(0);
        expect(state.de1.hiddenOptionGroups.size).toBe(0);
        expect(state['section:section-a'].hidden).toBe(true);
        expect(state['section:section-a'].hiddenSections.has('section-a')).toBe(true);
    });
});

describe('evaluateAndMap', () => {
    it('folds multiple effects into field state', () => {
        const engine = {
            evaluate: () => [
                {
                    ruleActionType: ProgramRuleActionType.HIDEFIELD,
                    dataElement: 'hiddenField',
                },
                {
                    ruleActionType: ProgramRuleActionType.SETMANDATORYFIELD,
                    dataElement: 'requiredField',
                },
                {
                    ruleActionType: ProgramRuleActionType.ASSIGN,
                    dataElement: 'assignedField',
                    data: 'auto',
                },
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
