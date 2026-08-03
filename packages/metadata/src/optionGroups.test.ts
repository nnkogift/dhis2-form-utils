import { describe, expect, it } from 'vitest';
import { extractReferencedOptionGroupIds, resolveOptionGroups } from './optionGroups';
import type { ProgramRule } from './types';

describe('extractReferencedOptionGroupIds', () => {
    it('collects optionGroup ids from HIDEOPTIONGROUP and SHOWOPTIONGROUP actions', () => {
        const rules: ProgramRule[] = [
            {
                id: 'rule1',
                condition: 'true',
                programRuleActions: [
                    {
                        id: 'action1',
                        programRuleActionType: 'HIDEOPTIONGROUP',
                        optionGroup: { id: 'og1' },
                    },
                    {
                        id: 'action2',
                        programRuleActionType: 'SHOWOPTIONGROUP',
                        optionGroup: { id: 'og2' },
                    },
                ],
            },
        ];

        expect(extractReferencedOptionGroupIds(rules)).toEqual(['og1', 'og2']);
    });

    it('dedupes ids referenced by multiple actions/rules', () => {
        const rules: ProgramRule[] = [
            {
                id: 'rule1',
                condition: 'true',
                programRuleActions: [
                    {
                        id: 'action1',
                        programRuleActionType: 'HIDEOPTIONGROUP',
                        optionGroup: { id: 'og1' },
                    },
                ],
            },
            {
                id: 'rule2',
                condition: 'true',
                programRuleActions: [
                    {
                        id: 'action2',
                        programRuleActionType: 'SHOWOPTIONGROUP',
                        optionGroup: { id: 'og1' },
                    },
                ],
            },
        ];

        expect(extractReferencedOptionGroupIds(rules)).toEqual(['og1']);
    });

    it('ignores actions targeting other types (HIDEOPTION, HIDEFIELD) and missing optionGroup', () => {
        const rules: ProgramRule[] = [
            {
                id: 'rule1',
                condition: 'true',
                programRuleActions: [
                    { id: 'action1', programRuleActionType: 'HIDEOPTION', data: 'opt1' },
                    { id: 'action2', programRuleActionType: 'HIDEFIELD' },
                    { id: 'action3', programRuleActionType: 'HIDEOPTIONGROUP' },
                ],
            },
        ];

        expect(extractReferencedOptionGroupIds(rules)).toEqual([]);
    });

    it('returns an empty array for rules with no actions', () => {
        expect(extractReferencedOptionGroupIds([])).toEqual([]);
    });
});

describe('resolveOptionGroups', () => {
    it('maps optionGroups into a code map keyed by group id', () => {
        const map = resolveOptionGroups({
            optionGroups: {
                optionGroups: [
                    {
                        id: 'og1',
                        options: [{ code: 'A' }, { code: 'B' }],
                    },
                    {
                        id: 'og2',
                        options: [{ code: 'C' }],
                    },
                ],
            },
        });

        expect(map).toEqual({
            og1: ['A', 'B'],
            og2: ['C'],
        });
    });

    it('filters out options with no code', () => {
        const map = resolveOptionGroups({
            optionGroups: { optionGroups: [{ id: 'og1', options: [{ code: 'A' }, {}] }] },
        });

        expect(map).toEqual({ og1: ['A'] });
    });

    it('returns an empty map when optionGroups is missing', () => {
        expect(resolveOptionGroups({})).toEqual({});
    });

    it('returns an empty map when the nested optionGroups array is missing', () => {
        expect(resolveOptionGroups({ optionGroups: {} })).toEqual({});
    });
});
