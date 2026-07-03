import { ProgramRuleActionType } from '@dhis2-form-utils/metadata';
import type { RuleEffect } from '@dhis2-form-utils/rules';
import { describe, expect, it } from 'vitest';
import { buildTraceEntry } from './buildTraceEntry';

const ruleId = 'rule-1';

describe('buildTraceEntry', () => {
    it('groups effects by ruleId with resolved targetIds', () => {
        const effects: RuleEffect[] = [
            {
                ruleId,
                ruleActionType: ProgramRuleActionType.SHOWWARNING,
                dataElement: 'age',
                content: 'Too high',
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

        const entry = buildTraceEntry(['age'], effects, 'entry-1', 1000);

        expect(entry).toEqual({
            id: 'entry-1',
            timestamp: 1000,
            changedFields: ['age'],
            ruleResults: [
                {
                    ruleId,
                    effects: [
                        {
                            type: ProgramRuleActionType.SHOWWARNING,
                            targetId: 'age',
                            data: null,
                        },
                        {
                            type: ProgramRuleActionType.HIDESECTION,
                            targetId: 'section-a',
                            data: null,
                        },
                        {
                            type: ProgramRuleActionType.DISPLAYTEXT,
                            targetId: 'feedback:Info',
                            data: 'Details',
                        },
                    ],
                },
            ],
        });
    });

    it('skips passthrough effects without a target', () => {
        const effects: RuleEffect[] = [
            {
                ruleId,
                ruleActionType: ProgramRuleActionType.SENDMESSAGE,
            },
        ];

        const entry = buildTraceEntry(['age'], effects, 'entry-2', 2000);
        expect(entry.ruleResults).toEqual([]);
    });
});
