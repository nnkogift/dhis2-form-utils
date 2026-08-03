import {
    ProgramRuleActionType,
    ProgramRuleVariableSourceType,
    type ProgramRule,
    type ProgramRuleVariable,
    type ProgramStageMetadata,
} from '@dhis2-form-utils/metadata';
import { describe, expect, it } from 'vitest';
import { buildRuleEngine, buildRuleEngineContext, toRuleEventFromInput } from './context';
import { toRuleEnrollment } from './enrollmentContext';

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

    it('emits a real ASSIGN effect for a data element target via the official engine', () => {
        const context = buildContext([
            {
                id: 'rule-assign',
                condition: "d2:hasValue('age')",
                priority: 1,
                programRuleActions: [
                    {
                        programRuleActionType: ProgramRuleActionType.ASSIGN,
                        data: '#{age} * 2',
                        dataElement: {
                            id: 'riskScore',
                            displayName: 'Risk score',
                            valueType: 'INTEGER' as const,
                        },
                    },
                ],
            },
        ] as ProgramRule[]);
        const engine = buildRuleEngine(context);

        const effects = engine.evaluate({ age: 15, riskScore: '' });

        expect(effects).toHaveLength(1);
        expect(effects[0].ruleActionType).toBe(ProgramRuleActionType.ASSIGN);
        expect(effects[0].dataElement).toBe('riskScore');
        expect(effects[0].data).toBe('30');
    });

    it('resolves C{constantUid} when constants are passed into the context', () => {
        const constantUid = 'bCqvfPR02Im';
        const context = buildRuleEngineContext({
            stageMetadata,
            programRules: [
                {
                    id: 'rule-const',
                    condition: `C{${constantUid}} == 10`,
                    priority: 1,
                    programRuleActions: [
                        {
                            programRuleActionType: ProgramRuleActionType.SHOWWARNING,
                            content: 'Constant matched',
                            dataElement: {
                                id: 'age',
                                displayName: 'Age',
                                valueType: 'INTEGER' as const,
                            },
                        },
                    ],
                },
            ] as ProgramRule[],
            programRuleVariables: [],
            programStageId: 'stage-1',
            constants: [{ id: constantUid, value: 10 }],
        });
        const engine = buildRuleEngine(context);

        expect(engine.evaluate({})).toHaveLength(1);
        expect(engine.evaluate({})[0].content).toBe('Constant matched');
    });

    it('fires a d2:inUserGroup()-gated rule when supplementaryData includes the group', () => {
        const context = buildRuleEngineContext({
            stageMetadata,
            programRules: [
                {
                    id: 'rule-ug',
                    condition: "d2:inUserGroup('UG1xxxxxx01')",
                    priority: 1,
                    programRuleActions: [
                        {
                            programRuleActionType: ProgramRuleActionType.SHOWWARNING,
                            content: 'In group',
                            dataElement: {
                                id: 'age',
                                displayName: 'Age',
                                valueType: 'INTEGER' as const,
                            },
                        },
                    ],
                },
            ] as ProgramRule[],
            programRuleVariables: [],
            programStageId: 'stage-1',
            supplementaryData: { userGroups: ['UG1xxxxxx01'] },
        });
        const engine = buildRuleEngine(context);

        expect(engine.evaluate({})).toHaveLength(1);
        expect(engine.evaluate({})[0].content).toBe('In group');
    });

    it('resolves a TEI_ATTRIBUTE variable when enrollmentContext.enrollment is provided', () => {
        const teaId = 'tea-sex';
        const enrollmentMetadata = {
            id: 'prog-1',
            displayName: 'Tracker Program',
            trackedEntityType: { id: 'te-type-1' },
            displayIncidentDate: false,
            selectEnrollmentDatesInFuture: true,
            selectIncidentDatesInFuture: true,
            programTrackedEntityAttributes: [
                {
                    mandatory: false,
                    trackedEntityAttribute: {
                        id: teaId,
                        displayName: 'Sex',
                        valueType: 'TEXT' as const,
                    },
                },
            ],
            programRules: [],
            programRuleVariables: [],
            constants: [],
        };

        const context = buildRuleEngineContext({
            stageMetadata,
            programRules: [
                {
                    id: 'rule-tei',
                    condition: "#{sex} == 'F'",
                    priority: 1,
                    programRuleActions: [
                        {
                            programRuleActionType: ProgramRuleActionType.SHOWWARNING,
                            content: 'Female TEI',
                            dataElement: {
                                id: 'age',
                                displayName: 'Age',
                                valueType: 'INTEGER' as const,
                            },
                        },
                    ],
                },
            ] as ProgramRule[],
            programRuleVariables: [
                {
                    id: 'var-sex',
                    name: 'sex',
                    trackedEntityAttribute: {
                        id: teaId,
                        displayName: 'Sex',
                        valueType: 'TEXT' as const,
                    },
                    programRuleVariableSourceType: ProgramRuleVariableSourceType.TEI_ATTRIBUTE,
                },
            ] as ProgramRuleVariable[],
            programStageId: 'stage-1',
        });

        const engine = buildRuleEngine(context, {
            enrollment: toRuleEnrollment(enrollmentMetadata, {
                orgUnit: 'abcdefghijk',
                enrolledAt: '2024-01-01',
                [teaId]: 'F',
            }),
            events: [],
        });

        expect(engine.evaluate({})).toHaveLength(1);
        expect(engine.evaluate({})[0].content).toBe('Female TEI');
    });

    it('resolves V{event_count} from sibling events built via toRuleEventFromInput', () => {
        const context = buildRuleEngineContext({
            stageMetadata,
            programRules: [
                {
                    id: 'rule-event-count',
                    condition: 'V{event_count} >= 1',
                    priority: 1,
                    programRuleActions: [
                        {
                            programRuleActionType: ProgramRuleActionType.SHOWWARNING,
                            content: 'Has sibling events',
                            dataElement: {
                                id: 'age',
                                displayName: 'Age',
                                valueType: 'INTEGER' as const,
                            },
                        },
                    ],
                },
            ] as ProgramRule[],
            programRuleVariables: [],
            programStageId: 'stage-1',
        });

        const sibling = toRuleEventFromInput({
            event: 'sibling-1',
            programStage: 'stage-1',
            programStageName: 'Stage 1',
            eventDate: '2024-01-01',
            createdDate: '2024-01-01T00:00:00Z',
            orgUnit: 'abcdefghijk',
            dataValues: { age: 12 },
        });

        const engine = buildRuleEngine(context, { events: [sibling] });

        expect(engine.evaluate({})).toHaveLength(1);
        expect(engine.evaluate({})[0].content).toBe('Has sibling events');
    });
});
