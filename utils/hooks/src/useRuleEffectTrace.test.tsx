import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import {
    ProgramRuleActionType,
    ProgramRuleVariableSourceType,
    type TrackerProgramMetadata,
} from '@dhis2-form-utils/metadata';
import { FormStateProvider } from './FormStateContext';
import { useFieldRuleEffect, useSectionRuleEffect } from './useRuleEffectTrace';
import { useTrackerForm } from './useTrackerForm';

const teaId = 'tea-age';

function metadataWithRules(): TrackerProgramMetadata {
    return {
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
        programRules: [
            {
                id: 'rule-warning',
                condition: '#{age} > 10',
                priority: 1,
                name: 'Age warning',
                programRuleActions: [
                    {
                        id: 'action-warning',
                        programRuleActionType: ProgramRuleActionType.SHOWWARNING,
                        content: 'Age is high',
                        trackedEntityAttribute: { id: teaId },
                    },
                ],
            },
            {
                id: 'rule-section',
                condition: 'true',
                priority: 1,
                name: 'Hide section',
                programRuleActions: [
                    {
                        id: 'action-section',
                        programRuleActionType: ProgramRuleActionType.HIDESECTION,
                        programSection: { id: 'section-a' },
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
}

const trackerMetadata = metadataWithRules();

function useHarness() {
    const { form, formStore } = useTrackerForm({
        options: { programId: 'prog-1', metadata: trackerMetadata },
    });
    return { form, formStore };
}

describe('useRuleEffectTrace', () => {
    it('resolves the rule that hid a section, and null when nothing targets it', async () => {
        const { result: harness } = renderHook(() => useHarness());
        const wrapper = ({ children }: { children: ReactNode }) => (
            <FormStateProvider formStore={harness.current.formStore} form={harness.current.form}>
                {children}
            </FormStateProvider>
        );

        const { result } = renderHook(
            () => ({
                section: useSectionRuleEffect('section-a'),
                untouchedSection: useSectionRuleEffect('section-b'),
            }),
            { wrapper }
        );

        await waitFor(() => {
            expect(result.current.section).toEqual({
                ruleId: 'rule-section',
                ruleActionType: ProgramRuleActionType.HIDESECTION,
            });
        });
        expect(result.current.untouchedSection).toBeNull();
    });

    it('resolves the rule that warned a field once its condition fires', async () => {
        const { result: harness } = renderHook(() => useHarness());
        const wrapper = ({ children }: { children: ReactNode }) => (
            <FormStateProvider formStore={harness.current.formStore} form={harness.current.form}>
                {children}
            </FormStateProvider>
        );

        const { result } = renderHook(() => useFieldRuleEffect(teaId), { wrapper });

        expect(result.current).toBeNull();

        harness.current.form.setValue(teaId, '15', {
            shouldValidate: true,
            shouldDirty: true,
        });
        harness.current.form.setValue('orgUnit', 'abcdefghijk');
        harness.current.form.setValue('enrolledAt', '2024-01-01');

        await waitFor(() => {
            expect(result.current).toEqual({
                ruleId: 'rule-warning',
                ruleActionType: ProgramRuleActionType.SHOWWARNING,
            });
        });
    });
});
