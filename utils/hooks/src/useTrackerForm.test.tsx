import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
    ProgramRuleActionType,
    ProgramRuleVariableSourceType,
    type TrackerProgramMetadata,
} from '@dhis2-form-utils/metadata';
import { useTrackerForm } from './useTrackerForm';

const teaId = 'tea-age';

const baseMetadata = (): TrackerProgramMetadata => ({
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

describe('useTrackerForm', () => {
    it('returns form and formStore', () => {
        const { result } = renderHook(() =>
            useTrackerForm({
                options: {
                    programId: 'prog-1',
                    metadata: baseMetadata(),
                },
            })
        );

        expect(result.current.form).toBeDefined();
        expect(result.current.formStore).toBeDefined();
    });

    it('reactively evaluates TEA rules into the field store', async () => {
        const metadata: TrackerProgramMetadata = {
            ...baseMetadata(),
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
        };

        const { result } = renderHook(() =>
            useTrackerForm({ options: { programId: 'prog-1', metadata } })
        );

        result.current.form.setValue(teaId, '15', {
            shouldValidate: true,
            shouldDirty: true,
        });
        result.current.form.setValue('orgUnit', 'abcdefghijk');
        result.current.form.setValue('enrolledAt', '2024-01-01');

        await waitFor(() => {
            expect(result.current.formStore.fieldStore.getFieldSnapshot(teaId)?.warning).toBe(
                'Age is high'
            );
        });
    });

    it('evaluates section and feedback rule effects into non-field store', async () => {
        const metadata: TrackerProgramMetadata = {
            ...baseMetadata(),
            programRules: [
                {
                    id: 'rule-section',
                    condition: 'true',
                    priority: 1,
                    name: 'Section rule',
                    programRuleActions: [
                        {
                            id: 'action-section',
                            programRuleActionType: ProgramRuleActionType.HIDESECTION,
                            programSection: { id: 'section-a' },
                        },
                        {
                            id: 'action-feedback',
                            programRuleActionType: ProgramRuleActionType.DISPLAYTEXT,
                            content: 'Note',
                            data: '"Registration active"',
                            location: 'feedback',
                        },
                    ],
                },
            ],
            programRuleVariables: [],
        };

        const { result } = renderHook(() =>
            useTrackerForm({
                options: {
                    programId: 'prog-1',
                    metadata,
                },
            })
        );

        result.current.form.setValue('orgUnit', 'abcdefghijk');
        result.current.form.setValue('enrolledAt', '2024-01-01');

        await waitFor(() => {
            expect(
                result.current.formStore.nonFieldStore.getSectionSnapshot('section-a')?.hidden
            ).toBe(true);
            expect(
                result.current.formStore.nonFieldStore.getFeedbackSnapshot()['feedback:Note'].value
            ).toBe('Registration active');
        });
    });

    it('auto-derives constants from metadata.constants with no hook-level constants prop', async () => {
        const constantUid = 'bCqvfPR02Im';
        const metadata: TrackerProgramMetadata = {
            ...baseMetadata(),
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

        const { result } = renderHook(() =>
            useTrackerForm({ options: { programId: 'prog-1', metadata } })
        );

        result.current.form.setValue('orgUnit', 'abcdefghijk');
        result.current.form.setValue('enrolledAt', '2024-01-01');

        await waitFor(() => {
            expect(result.current.formStore.fieldStore.getFieldSnapshot(teaId)?.warning).toBe(
                'Constant matched'
            );
        });
    });

    it('resolves V{event_count} when events option is provided', async () => {
        const metadata: TrackerProgramMetadata = {
            ...baseMetadata(),
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
            useTrackerForm({ options: { programId: 'prog-1', metadata, events } })
        );

        result.current.form.setValue('orgUnit', 'abcdefghijk');
        result.current.form.setValue('enrolledAt', '2024-01-01');

        await waitFor(() => {
            expect(result.current.formStore.fieldStore.getFieldSnapshot(teaId)?.warning).toBe(
                'Has events'
            );
        });
    });

    it('fires d2:inUserGroup() rules when supplementaryData is provided', async () => {
        const metadata: TrackerProgramMetadata = {
            ...baseMetadata(),
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

        const supplementaryData = { userGroups: ['UG1xxxxxx01'] };

        const { result } = renderHook(() =>
            useTrackerForm({
                options: { programId: 'prog-1', metadata, supplementaryData },
            })
        );

        result.current.form.setValue('orgUnit', 'abcdefghijk');
        result.current.form.setValue('enrolledAt', '2024-01-01');

        await waitFor(() => {
            expect(result.current.formStore.fieldStore.getFieldSnapshot(teaId)?.warning).toBe(
                'In group'
            );
        });
    });
});
