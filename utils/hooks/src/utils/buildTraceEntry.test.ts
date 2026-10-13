import { ProgramRuleActionType } from '@nnkogift/dhis2-form-utils-metadata';
import type { RuleEffect } from '@nnkogift/dhis2-form-utils-rules';
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

    it('records SENDMESSAGE effects without a target using the action type', () => {
        const entry = buildTraceEntry(
            [],
            [{ ruleId, ruleActionType: ProgramRuleActionType.SENDMESSAGE, data: 'hi' }],
            'e',
            1
        );

        expect(entry.ruleResults).toEqual([
            {
                ruleId,
                effects: [{ type: 'SENDMESSAGE', targetId: 'SENDMESSAGE', data: 'hi' }],
            },
        ]);
    });

    it('uses the program stage as targetId for SCHEDULEEVENT and keeps data', () => {
        const entry = buildTraceEntry(
            [],
            [
                {
                    ruleId,
                    ruleActionType: ProgramRuleActionType.SCHEDULEEVENT,
                    programStage: 'stage-1',
                    data: '2026-01-01',
                },
            ],
            'e',
            1
        );

        expect(entry.ruleResults[0].effects).toEqual([
            { type: 'SCHEDULEEVENT', targetId: 'stage-1', data: '2026-01-01' },
        ]);
    });
});
