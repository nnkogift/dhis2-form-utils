import {
    ProgramRuleActionType,
    ProgramRuleVariableSourceType,
    type TrackerProgramMetadata,
} from '@dhis2-form-utils/metadata';
import { describe, expect, it } from 'vitest';
import { toRuleEventFromInput } from './context';
import { buildEnrollmentRuleEngine, buildEnrollmentRuleEngineContext } from './enrollmentContext';

const teaId = 'tea-age';

const baseTrackerMetadata = (): TrackerProgramMetadata => ({
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
                displayName: 'Age',
                valueType: 'INTEGER',
            },
        },
    ],
    programRules: [],
    programRuleVariables: [],
    constants: [],
});

const metadataWithTeaRule = (): TrackerProgramMetadata => ({
    ...baseTrackerMetadata(),
    programRules: [
        {
            id: 'rule-tea-warning',
            condition: '#{age} > 10',
            priority: 1,
            name: 'Age warning',
            programRuleActions: [
                {
                    id: 'action-1',
                    programRuleActionType: ProgramRuleActionType.SHOWWARNING,
                    content: 'Age is high',
                    trackedEntityAttribute: { id: teaId },
                },
            ],
        },
    ],
    programRuleVariables: [
        {
            id: 'var-age',
            name: 'age',
            programRuleVariableSourceType: ProgramRuleVariableSourceType.TEI_ATTRIBUTE,
            trackedEntityAttribute: { id: teaId },
            valueType: 'INTEGER',
        },
    ],
});

describe('buildEnrollmentRuleEngineContext / buildEnrollmentRuleEngine', () => {
    it('evaluates TEI_ATTRIBUTE rules with the official engine', () => {
        const context = buildEnrollmentRuleEngineContext(metadataWithTeaRule());
        const engine = buildEnrollmentRuleEngine(context);
        const effects = engine.evaluate({
            orgUnit: 'abcdefghijk',
            enrolledAt: '2024-01-01',
            [teaId]: '15',
        });

        expect(effects).toHaveLength(1);
        expect(effects[0].ruleActionType).toBe(ProgramRuleActionType.SHOWWARNING);
        expect(effects[0].content).toBe('Age is high');
        expect(effects[0].trackedEntityAttribute).toBe(teaId);
    });

    it('skips enrollment evaluation when the condition is not met', () => {
        const context = buildEnrollmentRuleEngineContext(metadataWithTeaRule());
        const engine = buildEnrollmentRuleEngine(context);
        const effects = engine.evaluate({
            orgUnit: 'abcdefghijk',
            enrolledAt: '2024-01-01',
            [teaId]: '8',
        });
        expect(effects).toHaveLength(0);
    });

    it('filters out DATAELEMENT_CURRENT_EVENT variables', () => {
        const metadata: TrackerProgramMetadata = {
            ...metadataWithTeaRule(),
            programRuleVariables: [
                {
                    id: 'var-de',
                    name: 'age',
                    programRuleVariableSourceType:
                        ProgramRuleVariableSourceType.DATAELEMENT_CURRENT_EVENT,
                    valueType: 'INTEGER',
                },
            ],
        };
        const context = buildEnrollmentRuleEngineContext(metadata);
        const engine = buildEnrollmentRuleEngine(context);
        const effects = engine.evaluate({
            orgUnit: 'abcdefghijk',
            enrolledAt: '2024-01-01',
            [teaId]: '15',
        });
        expect(effects).toHaveLength(0);
    });

    it('includes CALCULATED_VALUE variables in enrollment context', () => {
        const metadata: TrackerProgramMetadata = {
            ...baseTrackerMetadata(),
            programRules: [
                {
                    id: 'rule-calc',
                    condition: '#{calc} > 5',
                    priority: 1,
                    name: 'Calc rule',
                    programRuleActions: [
                        {
                            id: 'action-hide',
                            programRuleActionType: ProgramRuleActionType.HIDEFIELD,
                            trackedEntityAttribute: { id: teaId },
                        },
                    ],
                },
            ],
            programRuleVariables: [
                {
                    id: 'var-calc',
                    name: 'calc',
                    programRuleVariableSourceType: ProgramRuleVariableSourceType.CALCULATED_VALUE,
                    valueType: 'INTEGER',
                },
            ],
        };

        const context = buildEnrollmentRuleEngineContext(metadata);
        expect(context.context).not.toBeNull();
    });

    it('excludes stage-scoped rules from enrollment context', () => {
        const metadata: TrackerProgramMetadata = {
            ...metadataWithTeaRule(),
            programRules: [
                {
                    id: 'rule-stage',
                    condition: 'true',
                    priority: 1,
                    name: 'Stage rule',
                    programStage: { id: 'stage-1' },
                    programRuleActions: [
                        {
                            id: 'action-stage',
                            programRuleActionType: ProgramRuleActionType.HIDEFIELD,
                            trackedEntityAttribute: { id: teaId },
                        },
                    ],
                },
            ],
        };

        const context = buildEnrollmentRuleEngineContext(metadata);
        const engine = buildEnrollmentRuleEngine(context);
        expect(engine.evaluate({ orgUnit: 'abcdefghijk', enrolledAt: '2024-01-01' })).toEqual([]);
    });

    it('returns no effects when metadata has no enrollment rules', () => {
        const context = buildEnrollmentRuleEngineContext(baseTrackerMetadata());
        const engine = buildEnrollmentRuleEngine(context);
        expect(engine.evaluate({})).toEqual([]);
    });

    it('maps HIDEFIELD effects to trackedEntityAttribute', () => {
        const metadata: TrackerProgramMetadata = {
            ...baseTrackerMetadata(),
            programRules: [
                {
                    id: 'rule-hide',
                    condition: 'true',
                    priority: 1,
                    name: 'Hide age',
                    programRuleActions: [
                        {
                            id: 'action-hide',
                            programRuleActionType: ProgramRuleActionType.HIDEFIELD,
                            trackedEntityAttribute: { id: teaId },
                        },
                    ],
                },
            ],
            programRuleVariables: [],
        };

        const context = buildEnrollmentRuleEngineContext(metadata);
        const engine = buildEnrollmentRuleEngine(context);
        const effects = engine.evaluate({
            orgUnit: 'abcdefghijk',
            enrolledAt: '2024-01-01',
        });

        expect(effects[0].trackedEntityAttribute).toBe(teaId);
    });

    it('emits a real ASSIGN effect for a tracked entity attribute target via the official engine', () => {
        const riskScoreTeaId = 'tea-risk-score';
        const metadata: TrackerProgramMetadata = {
            ...metadataWithTeaRule(),
            programRules: [
                {
                    id: 'rule-assign',
                    condition: "d2:hasValue('age')",
                    priority: 1,
                    name: 'Assign risk score',
                    programRuleActions: [
                        {
                            id: 'action-assign',
                            programRuleActionType: ProgramRuleActionType.ASSIGN,
                            data: '#{age} * 2',
                            trackedEntityAttribute: { id: riskScoreTeaId },
                        },
                    ],
                },
            ],
        };

        const context = buildEnrollmentRuleEngineContext(metadata);
        const engine = buildEnrollmentRuleEngine(context);
        const effects = engine.evaluate({
            orgUnit: 'abcdefghijk',
            enrolledAt: '2024-01-01',
            [teaId]: '15',
            [riskScoreTeaId]: '',
        });

        expect(effects).toHaveLength(1);
        expect(effects[0].ruleActionType).toBe(ProgramRuleActionType.ASSIGN);
        expect(effects[0].trackedEntityAttribute).toBe(riskScoreTeaId);
        expect(effects[0].data).toBe('30');
    });

    it('resolves C{constantUid} from metadata.constants', () => {
        const constantUid = 'bCqvfPR02Im';
        const metadata: TrackerProgramMetadata = {
            ...baseTrackerMetadata(),
            constants: [{ id: constantUid, value: 10 }],
            programRules: [
                {
                    id: 'rule-const',
                    condition: `C{${constantUid}} == 10`,
                    priority: 1,
                    name: 'Constant rule',
                    programRuleActions: [
                        {
                            id: 'action-const',
                            programRuleActionType: ProgramRuleActionType.SHOWWARNING,
                            content: 'Constant matched',
                            trackedEntityAttribute: { id: teaId },
                        },
                    ],
                },
            ],
        };

        const context = buildEnrollmentRuleEngineContext(metadata);
        const engine = buildEnrollmentRuleEngine(context);
        const effects = engine.evaluate({
            orgUnit: 'abcdefghijk',
            enrolledAt: '2024-01-01',
        });

        expect(effects).toHaveLength(1);
        expect(effects[0].content).toBe('Constant matched');
    });

    it('fires a d2:inUserGroup()-gated enrollment rule when supplementaryData is passed', () => {
        const metadata: TrackerProgramMetadata = {
            ...baseTrackerMetadata(),
            programRules: [
                {
                    id: 'rule-ug',
                    condition: "d2:inUserGroup('UG1xxxxxx01')",
                    priority: 1,
                    name: 'User group rule',
                    programRuleActions: [
                        {
                            id: 'action-ug',
                            programRuleActionType: ProgramRuleActionType.SHOWWARNING,
                            content: 'In group',
                            trackedEntityAttribute: { id: teaId },
                        },
                    ],
                },
            ],
        };

        const context = buildEnrollmentRuleEngineContext(metadata, {
            userGroups: ['UG1xxxxxx01'],
        });
        const engine = buildEnrollmentRuleEngine(context);
        const effects = engine.evaluate({
            orgUnit: 'abcdefghijk',
            enrolledAt: '2024-01-01',
        });

        expect(effects).toHaveLength(1);
        expect(effects[0].content).toBe('In group');
    });

    it('resolves V{event_count} when other events are passed to buildEnrollmentRuleEngine', () => {
        const metadata: TrackerProgramMetadata = {
            ...baseTrackerMetadata(),
            programRules: [
                {
                    id: 'rule-event-count',
                    condition: 'V{event_count} >= 1',
                    priority: 1,
                    name: 'Event count rule',
                    programRuleActions: [
                        {
                            id: 'action-count',
                            programRuleActionType: ProgramRuleActionType.SHOWWARNING,
                            content: 'Has events',
                            trackedEntityAttribute: { id: teaId },
                        },
                    ],
                },
            ],
        };

        const context = buildEnrollmentRuleEngineContext(metadata);
        const sibling = toRuleEventFromInput({
            event: 'sibling-1',
            programStage: 'stage-1',
            eventDate: '2024-01-01',
            createdDate: '2024-01-01T00:00:00Z',
            orgUnit: 'abcdefghijk',
            dataValues: { age: 12 },
        });
        const engine = buildEnrollmentRuleEngine(context, [sibling]);
        const effects = engine.evaluate({
            orgUnit: 'abcdefghijk',
            enrolledAt: '2024-01-01',
        });

        expect(effects).toHaveLength(1);
        expect(effects[0].content).toBe('Has events');
    });
});
