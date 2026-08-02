import { describe, expect, it } from 'vitest';
import { resolveEventProgramMetadata } from './resolveEventProgramMetadata';

describe('resolveEventProgramMetadata', () => {
    it('resolves a full raw API response into EventProgramMetadata', () => {
        const result = resolveEventProgramMetadata({
            program: {
                id: 'program1',
                displayName: 'Program One',
                code: 'P1',
                shortName: 'Prog1',
                programType: 'WITHOUT_REGISTRATION',
                programStages: [
                    {
                        id: 'stage1',
                        displayName: 'Stage One',
                        programStageDataElements: [],
                    },
                ],
            },
            programRules: {
                programRules: [
                    {
                        id: 'rule1',
                        displayName: 'Rule One',
                        condition: 'true',
                        priority: 1,
                        programRuleActions: [],
                    },
                ],
            },
            programRuleVariables: {
                programRuleVariables: [
                    {
                        id: 'var1',
                        name: 'Var One',
                        programRuleVariableSourceType: 'DATAELEMENT_CURRENT_EVENT',
                        valueType: 'TEXT',
                    },
                ],
            },
            constants: {
                constants: [{ id: 'const1', value: 10 }],
            },
        });

        expect(result).toEqual({
            id: 'program1',
            displayName: 'Program One',
            code: 'P1',
            shortName: 'Prog1',
            programType: 'WITHOUT_REGISTRATION',
            programStages: [
                {
                    id: 'stage1',
                    displayName: 'Stage One',
                    programStageDataElements: [],
                },
            ],
            programRules: [
                {
                    id: 'rule1',
                    displayName: 'Rule One',
                    condition: 'true',
                    priority: 1,
                    programRuleActions: [],
                },
            ],
            programRuleVariables: [
                {
                    id: 'var1',
                    name: 'Var One',
                    programRuleVariableSourceType: 'DATAELEMENT_CURRENT_EVENT',
                    valueType: 'TEXT',
                },
            ],
            constants: [{ id: 'const1', value: 10 }],
        });
    });

    it('resolves cleanly with empty programRules and programRuleVariables — not error states', () => {
        const result = resolveEventProgramMetadata({
            program: {
                id: 'program1',
                displayName: 'Program One',
                programType: 'WITHOUT_REGISTRATION',
                programStages: [],
            },
            programRules: { programRules: [] },
            programRuleVariables: { programRuleVariables: [] },
            constants: { constants: [] },
        });

        expect(result.programRules).toEqual([]);
        expect(result.programRuleVariables).toEqual([]);
        expect(result.constants).toEqual([]);
    });

    it('defaults constants to [] when absent and passes through when present', () => {
        const withoutConstants = resolveEventProgramMetadata({
            program: {
                id: 'program1',
                displayName: 'Program One',
                programType: 'WITHOUT_REGISTRATION',
                programStages: [],
            },
            programRules: { programRules: [] },
            programRuleVariables: { programRuleVariables: [] },
            constants: undefined,
        });
        expect(withoutConstants.constants).toEqual([]);

        const withConstants = resolveEventProgramMetadata({
            program: {
                id: 'program1',
                displayName: 'Program One',
                programType: 'WITHOUT_REGISTRATION',
                programStages: [],
            },
            programRules: { programRules: [] },
            programRuleVariables: { programRuleVariables: [] },
            constants: { constants: [{ id: 'c1', value: 42 }] },
        });
        expect(withConstants.constants).toEqual([{ id: 'c1', value: 42 }]);
    });

    it('never throws — resolves defensively when nested resources are missing', () => {
        expect(() =>
            resolveEventProgramMetadata({
                program: undefined,
                programRules: undefined,
                programRuleVariables: undefined,
                constants: undefined,
            })
        ).not.toThrow();

        const result = resolveEventProgramMetadata({
            program: undefined,
            programRules: undefined,
            programRuleVariables: undefined,
            constants: undefined,
        });

        expect(result).toEqual({
            id: '',
            displayName: '',
            code: undefined,
            shortName: undefined,
            programType: '',
            programStages: [],
            programRules: [],
            programRuleVariables: [],
            constants: [],
        });
    });
});
