import { describe, expect, it } from 'vitest';
import { resolveTrackerProgramMetadata } from './resolveTrackerProgramMetadata';

describe('resolveTrackerProgramMetadata', () => {
    it('resolves a full raw API response into TrackerProgramMetadata', () => {
        const result = resolveTrackerProgramMetadata({
            program: {
                id: 'program1',
                displayName: 'Program One',
                trackedEntityType: { id: 'tet1' },
                displayIncidentDate: true,
                selectEnrollmentDatesInFuture: false,
                selectIncidentDatesInFuture: false,
                displayEnrollmentDateLabel: 'Enrollment date',
                displayIncidentDateLabel: 'Incident date',
                programTrackedEntityAttributes: [
                    {
                        id: 'ptea2',
                        mandatory: false,
                        sortOrder: 2,
                        trackedEntityAttribute: { id: 'tea2', valueType: 'TEXT' },
                    },
                    {
                        id: 'ptea1',
                        mandatory: true,
                        sortOrder: 1,
                        trackedEntityAttribute: { id: 'tea1', valueType: 'TEXT' },
                    },
                ],
            },
            programRules: {
                programRules: [
                    {
                        id: 'rule1',
                        name: 'Rule One',
                        condition: 'true',
                        priority: 1,
                        programStage: undefined,
                        programRuleActions: [
                            {
                                id: 'action1',
                                programRuleActionType: 'HIDEFIELD',
                                trackedEntityAttribute: { id: 'tea1', valueType: 'TEXT' },
                                dataElement: { id: 'shouldBeDropped', valueType: 'TEXT' },
                            },
                        ],
                    },
                ],
            },
            programRuleVariables: {
                programRuleVariables: [
                    {
                        id: 'var1',
                        name: 'TEI Var',
                        programRuleVariableSourceType: 'TEI_ATTRIBUTE',
                        trackedEntityAttribute: { id: 'tea1', valueType: 'TEXT' },
                        valueType: 'TEXT',
                    },
                ],
            },
        });

        expect(result.id).toBe('program1');
        expect(result.displayName).toBe('Program One');
        expect(result.trackedEntityType).toEqual({ id: 'tet1' });
        expect(result.displayEnrollmentDateLabel).toBe('Enrollment date');
        expect(result.displayIncidentDateLabel).toBe('Incident date');

        // Sorted by sortOrder ascending.
        expect(result.programTrackedEntityAttributes.map((p) => p.id)).toEqual(['ptea1', 'ptea2']);

        expect(result.programRules).toEqual([
            {
                id: 'rule1',
                condition: 'true',
                priority: 1,
                name: 'Rule One',
                programStage: undefined,
                programRuleActions: [
                    {
                        id: 'action1',
                        programRuleActionType: 'HIDEFIELD',
                        data: undefined,
                        content: undefined,
                        trackedEntityAttribute: { id: 'tea1', valueType: 'TEXT' },
                        programStageSection: undefined,
                        location: undefined,
                        programSection: undefined,
                    },
                ],
            },
        ]);
    });

    it('resolves cleanly with empty programRules and programRuleVariables — not error states', () => {
        const result = resolveTrackerProgramMetadata({
            program: {
                id: 'program1',
                displayName: 'Program One',
                programTrackedEntityAttributes: [],
            },
            programRules: { programRules: [] },
            programRuleVariables: { programRuleVariables: [] },
        });

        expect(result.programRules).toEqual([]);
        expect(result.programRuleVariables).toEqual([]);
    });

    it('never throws when nested resources are missing', () => {
        expect(() =>
            resolveTrackerProgramMetadata({
                program: undefined,
                programRules: undefined,
                programRuleVariables: undefined,
            })
        ).not.toThrow();
    });

    it("passes through mixed DATAELEMENT_* and TEI_ATTRIBUTE variables unfiltered — filtering is buildEnrollmentRuleEngineContext's job", () => {
        const result = resolveTrackerProgramMetadata({
            program: {
                id: 'program1',
                displayName: 'Program One',
                programTrackedEntityAttributes: [],
            },
            programRules: { programRules: [] },
            programRuleVariables: {
                programRuleVariables: [
                    {
                        id: 'var1',
                        name: 'DE Var',
                        programRuleVariableSourceType: 'DATAELEMENT_CURRENT_EVENT',
                        dataElement: { id: 'de1', valueType: 'TEXT' },
                        valueType: 'TEXT',
                    },
                    {
                        id: 'var2',
                        name: 'TEI Var',
                        programRuleVariableSourceType: 'TEI_ATTRIBUTE',
                        trackedEntityAttribute: { id: 'tea1', valueType: 'TEXT' },
                        valueType: 'TEXT',
                    },
                ],
            },
        });

        expect(result.programRuleVariables).toHaveLength(2);
        expect(result.programRuleVariables.map((v) => v.programRuleVariableSourceType)).toEqual([
            'DATAELEMENT_CURRENT_EVENT',
            'TEI_ATTRIBUTE',
        ]);
    });
});
