import {
    ProgramRuleActionType,
    ProgramRuleVariableSourceType,
    type TrackerProgramMetadata,
} from '@dhis2-form-utils/metadata';
import { describe, expect, it } from 'vitest';
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
});
