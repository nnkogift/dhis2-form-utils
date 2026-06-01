import {
    Dhis2ValueType,
    ProgramRuleActionType,
    ProgramRuleVariableSourceType,
    type ProgramStageMetadata,
} from '@dhis2-form-utils/metadata';
import { describe, expect, it } from 'vitest';
import { buildRuleEngine, buildRuleEngineContext } from './context';

const metadataWithRules: ProgramStageMetadata = {
    id: 'stage-1',
    displayName: 'Stage 1',
    programStageDataElements: [
        {
            dataElement: {
                id: 'age',
                displayName: 'Age',
                valueType: Dhis2ValueType.INTEGER,
            },
        },
    ],
    programRules: [
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
                        valueType: Dhis2ValueType.INTEGER,
                    },
                },
            ],
        },
    ],
    programRuleVariables: [
        {
            id: 'var-1',
            name: 'age',
            dataElement: {
                id: 'age',
                displayName: 'Age',
                valueType: Dhis2ValueType.INTEGER,
            },
            programRuleVariableSourceType: ProgramRuleVariableSourceType.DATAELEMENT_CURRENT_EVENT,
        },
    ],
};

describe('buildRuleEngineContext / buildRuleEngine', () => {
    it('evaluates metadata rules with the official engine', () => {
        const context = buildRuleEngineContext(metadataWithRules);
        const engine = buildRuleEngine(context);
        const effects = engine.evaluate({ age: 15 });

        expect(effects).toHaveLength(1);
        expect(effects[0].ruleActionType).toBe(ProgramRuleActionType.SHOWWARNING);
        expect(effects[0].content).toBe('Age is high');
        expect(effects[0].dataElement).toBe('age');
    });

    it('skips events when the condition is not met', () => {
        const context = buildRuleEngineContext(metadataWithRules);
        const engine = buildRuleEngine(context);
        const effects = engine.evaluate({ age: 8 });
        expect(effects).toHaveLength(0);
    });

    it('returns no effects when metadata has no rules', () => {
        const context = buildRuleEngineContext({
            id: 'stage-empty',
            displayName: 'Empty',
            programStageDataElements: [],
            programRules: [],
            programRuleVariables: [],
        });
        const engine = buildRuleEngine(context);
        expect(engine.evaluate({})).toEqual([]);
    });
});
