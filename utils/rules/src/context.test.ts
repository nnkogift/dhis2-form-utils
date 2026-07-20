import {
    ProgramRuleActionType,
    ProgramRuleVariableSourceType,
    type ProgramRule,
    type ProgramRuleVariable,
    type ProgramStageMetadata,
} from '@dhis2-form-utils/metadata';
import { describe, expect, it } from 'vitest';
import { buildRuleEngine, buildRuleEngineContext } from './context';

const stageMetadata = {
    id: 'stage-1',
    displayName: 'Stage 1',
    programStageDataElements: [
        {
            dataElement: {
                id: 'age',
                displayName: 'Age',
                valueType: 'INTEGER' as const,
            },
        },
    ],
} as ProgramStageMetadata;

const programRules = [
    {
        id: 'rule-1',
        condition: '#{age} > 10',
        priority: 1,
        programRuleActions: [
            {
                programRuleActionType: ProgramRuleActionType.SHOWWARNING,
                content: 'Age is high',
                dataElement: {
                    id: 'age',
                    displayName: 'Age',
                    valueType: 'INTEGER' as const,
                },
            },
        ],
    },
] as ProgramRule[];

const programRuleVariables = [
    {
        id: 'var-1',
        name: 'age',
        dataElement: {
            id: 'age',
            displayName: 'Age',
            valueType: 'INTEGER' as const,
        },
        programRuleVariableSourceType: ProgramRuleVariableSourceType.DATAELEMENT_CURRENT_EVENT,
    },
] as ProgramRuleVariable[];

const buildContext = (rules = programRules, variables = programRuleVariables) =>
    buildRuleEngineContext({
        stageMetadata,
        programRules: rules,
        programRuleVariables: variables,
        programStageId: 'stage-1',
    });

describe('buildRuleEngineContext / buildRuleEngine', () => {
    it('evaluates metadata rules with the official engine', () => {
        const context = buildContext();
        const engine = buildRuleEngine(context);
        const effects = engine.evaluate({ age: 15 });

        expect(effects).toHaveLength(1);
        expect(effects[0].ruleId).toBe('rule-1');
        expect(effects[0].ruleActionType).toBe(ProgramRuleActionType.SHOWWARNING);
        expect(effects[0].content).toBe('Age is high');
        expect(effects[0].dataElement).toBe('age');
    });

    it('skips events when the condition is not met', () => {
        const context = buildContext();
        const engine = buildRuleEngine(context);
        const effects = engine.evaluate({ age: 8 });
        expect(effects).toHaveLength(0);
    });

    it('returns no effects when metadata has no rules', () => {
        const context = buildContext([], []);
        const engine = buildRuleEngine(context);
        expect(engine.evaluate({})).toEqual([]);
    });

    it('excludes rules scoped to a different program stage', () => {
        const context = buildContext([
            {
                ...programRules[0],
                id: 'rule-other-stage',
                programStage: { id: 'stage-2' },
            },
        ]);
        const engine = buildRuleEngine(context);
        expect(engine.evaluate({ age: 15 })).toEqual([]);
    });

    it('includes program-wide rules without a program stage', () => {
        const context = buildContext([
            {
                ...programRules[0],
                id: 'rule-program-wide',
            },
        ]);
        const engine = buildRuleEngine(context);
        expect(engine.evaluate({ age: 15 })).toHaveLength(1);
    });
});
