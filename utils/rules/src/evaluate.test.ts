import { ProgramRuleActionType } from '@dhis2-form-utils/metadata';
import { describe, expect, it, vi } from 'vitest';
import { applyEffect, evaluateAndMap } from './evaluate';
import { partitionEffects } from './partitionEffects';
import { createEmptyFieldState } from './types';

describe('applyEffect', () => {
    const ruleId = 'test-rule';

    it('hides a field on HIDEFIELD', () => {
        const state = applyEffect(
            {},
            {
                ruleId,
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
                ruleId,
                ruleActionType: ProgramRuleActionType.SETMANDATORYFIELD,
                dataElement: 'de1',
            }
        );
        state = applyEffect(state, {
            ruleId,
            ruleActionType: ProgramRuleActionType.SHOWWARNING,
            dataElement: 'de1',
            content: 'Check value',
        });
        expect(state.de1.mandatory).toBe(true);
        expect(state.de1.warning).toBe('Check value');
    });

    it('sets completion-time warnings and errors', () => {
        let state = applyEffect(
            {},
            {
                ruleId,
                ruleActionType: ProgramRuleActionType.WARNINGONCOMPLETE,
                dataElement: 'de1',
                content: 'Complete warning',
            }
        );
        state = applyEffect(state, {
            ruleId,
            ruleActionType: ProgramRuleActionType.ERRORONCOMPLETE,
            dataElement: 'de1',
            content: 'Complete error',
        });
        expect(state.de1.warningOnComplete).toBe('Complete warning');
        expect(state.de1.errorOnComplete).toBe('Complete error');
    });

    it('applies option visibility effects', () => {
        let state = applyEffect(
            {},
            {
                ruleId,
                ruleActionType: ProgramRuleActionType.HIDEOPTION,
                dataElement: 'de1',
                optionCode: 'opt1',
            }
        );

        state = applyEffect(state, {
            ruleId,
            ruleActionType: ProgramRuleActionType.SHOWOPTION,
            dataElement: 'de1',
            optionCode: 'opt1',
        });

        state = applyEffect(state, {
            ruleId,
            ruleActionType: ProgramRuleActionType.HIDEOPTIONGROUP,
            dataElement: 'de1',
            optionGroupId: 'og1',
        });

        state = applyEffect(state, {
            ruleId,
            ruleActionType: ProgramRuleActionType.SHOWOPTIONGROUP,
            dataElement: 'de1',
            optionGroupId: 'og1',
        });

        expect(state.de1.hiddenOptions.size).toBe(0);
        expect(state.de1.hiddenOptionGroups.size).toBe(0);
    });

    it('ignores HIDESECTION (handled by partition)', () => {
        const state = applyEffect(
            {},
            {
                ruleId,
                ruleActionType: ProgramRuleActionType.HIDESECTION,
                programStageSection: 'section-a',
            }
        );
        expect(Object.keys(state)).toHaveLength(0);
    });
});

describe('partitionEffects', () => {
    const ruleId = 'test-rule';

    it('routes effects into field, section, feedback, and passthrough buckets', () => {
        const effects = [
            { ruleId, ruleActionType: ProgramRuleActionType.HIDEFIELD, dataElement: 'de1' },
            {
                ruleId,
                ruleActionType: ProgramRuleActionType.HIDESECTION,
                programStageSection: 'sec1',
            },
            {
                ruleId,
                ruleActionType: ProgramRuleActionType.DISPLAYTEXT,
                content: 'Label',
                data: 'Value',
                location: 'feedback',
            },
            { ruleId, ruleActionType: ProgramRuleActionType.SENDMESSAGE },
        ];

        const result = partitionEffects(effects);

        expect(result.fieldEffects).toHaveLength(1);
        expect(result.sectionEffects).toHaveLength(1);
        expect(result.feedbackEffects).toHaveLength(1);
        expect(result.passthroughEffects).toHaveLength(1);
    });
});

describe('evaluateAndMap', () => {
    const ruleId = 'test-rule';

    it('folds multiple effects into three maps', () => {
        const engineEffects = [
            {
                ruleId,
                ruleActionType: ProgramRuleActionType.HIDEFIELD,
                dataElement: 'hiddenField',
            },
            {
                ruleId,
                ruleActionType: ProgramRuleActionType.SETMANDATORYFIELD,
                dataElement: 'requiredField',
            },
            {
                ruleId,
                ruleActionType: ProgramRuleActionType.ASSIGN,
                dataElement: 'assignedField',
                data: 'auto',
            },
            {
                ruleId,
                ruleActionType: ProgramRuleActionType.HIDESECTION,
                programStageSection: 'section-a',
            },
            {
                ruleId,
                ruleActionType: ProgramRuleActionType.DISPLAYTEXT,
                content: 'Info',
                data: 'Details',
                location: 'feedback',
            },
        ];
        const engine = {
            evaluate: () => engineEffects,
        };

        const result = evaluateAndMap(engine, {
            hiddenField: 'x',
            requiredField: '',
            assignedField: '',
        });

        expect(result.fieldMap.hiddenField.hidden).toBe(true);
        expect(result.fieldMap.requiredField.mandatory).toBe(true);
        expect(result.fieldMap.assignedField.assignedValue).toBe('auto');
        expect(result.sectionMap['section-a'].hidden).toBe(true);
        expect(result.feedback['feedback:Info']).toEqual({
            type: 'text',
            content: 'Info',
            value: 'Details',
            location: 'feedback',
        });
        expect(result.effects).toEqual(engineEffects);
    });

    it('invokes custom effect handlers for passthrough effects', () => {
        const handler = vi.fn();
        const engine = {
            evaluate: () => [{ ruleId, ruleActionType: ProgramRuleActionType.SENDMESSAGE }],
        };

        evaluateAndMap(engine, {}, { SENDMESSAGE: handler });

        expect(handler).toHaveBeenCalledTimes(1);
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
