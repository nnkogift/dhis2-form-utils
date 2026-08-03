import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
    ProgramRuleActionType,
    ProgramRuleVariableSourceType,
    type EventProgramMetadata,
    type TrackerProgramMetadata,
} from '@dhis2-form-utils/metadata';
import { useEventForm } from './useEventForm';

const baseMetadata = {
    id: 'program-1',
    displayName: 'Program',
    programType: 'WITHOUT_REGISTRATION',
    programStages: [
        {
            id: 'stage-1',
            displayName: 'Stage',
            programStageDataElements: [],
        },
    ],
    programRules: [],
    programRuleVariables: [],
    constants: [],
} as unknown as EventProgramMetadata;

describe('useEventForm', () => {
    it('returns form and formStore', () => {
        const { result } = renderHook(() =>
            useEventForm({
                options: {
                    programStageId: 'stage-1',
                    metadata: baseMetadata,
                },
            })
        );

        expect(result.current.form).toBeDefined();
        expect(result.current.formStore).toBeDefined();
    });

    it('reactively evaluates field rules into the field store', async () => {
        const metadata = {
            id: 'program-rules',
            displayName: 'Rule Program',
            programType: 'WITHOUT_REGISTRATION',
            programStages: [
                {
                    id: 'stage-rules',
                    displayName: 'Rule Stage',
                    programStageDataElements: [
                        {
                            dataElement: {
                                id: 'age',
                                displayName: 'Age',
                                valueType: 'INTEGER' as const,
                            },
                        },
                    ],
                },
            ],
            programRules: [
                {
                    id: 'rule-age-warning',
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
            ],
            programRuleVariables: [
                {
                    id: 'var-age',
                    name: 'age',
                    dataElement: {
                        id: 'age',
                        displayName: 'Age',
                        valueType: 'INTEGER' as const,
                    },
                    programRuleVariableSourceType:
                        ProgramRuleVariableSourceType.DATAELEMENT_CURRENT_EVENT,
                },
            ],
            constants: [],
        } as unknown as EventProgramMetadata;

        const { result } = renderHook(() =>
            useEventForm({ options: { programStageId: 'stage-rules', metadata } })
        );

        result.current.form.setValue('age', '15', {
            shouldValidate: true,
            shouldDirty: true,
        });

        await waitFor(() => {
            expect(result.current.formStore.fieldStore.getFieldSnapshot('age')?.warning).toBe(
                'Age is high'
            );
        });
    });

    it('evaluates section and feedback rule effects into non-field store', async () => {
        const metadata = {
            ...baseMetadata,
            programRules: [
                {
                    id: 'rule-section',
                    condition: 'true',
                    priority: 1,
                    programRuleActions: [
                        {
                            programRuleActionType: ProgramRuleActionType.HIDESECTION,
                            programStageSection: { id: 'section-a' },
                        },
                        {
                            programRuleActionType: ProgramRuleActionType.DISPLAYTEXT,
                            content: 'Note',
                            data: '"Hidden section active"',
                            location: 'feedback',
                        },
                    ],
                },
            ],
        } as unknown as EventProgramMetadata;

        const { result } = renderHook(() =>
            useEventForm({
                options: {
                    programStageId: 'stage-1',
                    metadata,
                },
            })
        );

        await waitFor(() => {
            expect(
                result.current.formStore.nonFieldStore.getSectionSnapshot('section-a')?.hidden
            ).toBe(true);
            expect(
                result.current.formStore.nonFieldStore.getFeedbackSnapshot()['feedback:Note'].value
            ).toBe('Hidden section active');
        });
    });

    it('auto-derives constants from metadata.constants with no hook-level constants prop', async () => {
        const constantUid = 'bCqvfPR02Im';
        const metadata = {
            ...baseMetadata,
            constants: [{ id: constantUid, value: 10 }],
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
            ],
        } as unknown as EventProgramMetadata;

        const { result } = renderHook(() =>
            useEventForm({ options: { programStageId: 'stage-1', metadata } })
        );

        await waitFor(() => {
            expect(result.current.formStore.fieldStore.getFieldSnapshot('age')?.warning).toBe(
                'Constant matched'
            );
        });
    });

    it('resolves TEI_ATTRIBUTE rules when enrollment option is provided', async () => {
        const teaId = 'tea-sex';
        const enrollmentMetadata: TrackerProgramMetadata = {
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
                        valueType: 'TEXT',
                    },
                },
            ],
            programRules: [],
            programRuleVariables: [],
            constants: [],
        };

        const metadata = {
            ...baseMetadata,
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
            ],
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
            ],
        } as unknown as EventProgramMetadata;

        const enrollment = {
            metadata: enrollmentMetadata,
            values: {
                orgUnit: 'abcdefghijk',
                enrolledAt: '2024-01-01',
                [teaId]: 'F',
            },
        };

        const { result } = renderHook(() =>
            useEventForm({
                options: { programStageId: 'stage-1', metadata, enrollment },
            })
        );

        await waitFor(() => {
            expect(result.current.formStore.fieldStore.getFieldSnapshot('age')?.warning).toBe(
                'Female TEI'
            );
        });
    });

    it('resolves V{event_count} when events option is provided', async () => {
        const metadata = {
            ...baseMetadata,
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
            ],
        } as unknown as EventProgramMetadata;

        const events = [
            {
                event: 'sibling-1',
                programStage: 'stage-1',
                eventDate: '2024-01-01',
                createdDate: '2024-01-01T00:00:00Z',
                orgUnit: 'abcdefghijk',
                dataValues: { age: 12 },
            },
        ];

        const { result } = renderHook(() =>
            useEventForm({
                options: { programStageId: 'stage-1', metadata, events },
            })
        );

        await waitFor(() => {
            expect(result.current.formStore.fieldStore.getFieldSnapshot('age')?.warning).toBe(
                'Has sibling events'
            );
        });
    });

    it('fires d2:inUserGroup() rules when supplementaryData is provided', async () => {
        const metadata = {
            ...baseMetadata,
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
            ],
        } as unknown as EventProgramMetadata;

        const supplementaryData = { userGroups: ['UG1xxxxxx01'] };

        const { result } = renderHook(() =>
            useEventForm({
                options: { programStageId: 'stage-1', metadata, supplementaryData },
            })
        );

        await waitFor(() => {
            expect(result.current.formStore.fieldStore.getFieldSnapshot('age')?.warning).toBe(
                'In group'
            );
        });
    });
});
