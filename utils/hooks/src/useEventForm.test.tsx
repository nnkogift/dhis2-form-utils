import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
    Dhis2ValueType,
    ProgramRuleActionType,
    ProgramRuleVariableSourceType,
    type ProgramStageMetadata,
} from '@dhis2-form-utils/metadata';
import { useEventForm } from './useEventForm';

const baseMetadata: ProgramStageMetadata = {
    id: 'stage-1',
    displayName: 'Stage',
    programStageDataElements: [],
};

describe('useEventForm', () => {
    it('returns form, stores, and submit', () => {
        const { result } = renderHook(() =>
            useEventForm({ programStageId: 'stage-1', metadata: baseMetadata })
        );

        expect(result.current.form).toBeDefined();
        expect(result.current.formStore).toBeDefined();
        expect(result.current.fieldStore).toBeDefined();
        expect(result.current.nonFieldStore).toBeDefined();
        expect(typeof result.current.submit).toBe('function');
    });

    it('reactively evaluates field rules into the field store', async () => {
        const metadata: ProgramStageMetadata = {
            id: 'stage-rules',
            displayName: 'Rule Stage',
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
                                valueType: Dhis2ValueType.INTEGER,
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
                        valueType: Dhis2ValueType.INTEGER,
                    },
                    programRuleVariableSourceType:
                        ProgramRuleVariableSourceType.DATAELEMENT_CURRENT_EVENT,
                },
            ],
        };

        const { result } = renderHook(() =>
            useEventForm({ programStageId: 'stage-rules', metadata })
        );

        result.current.form.setValue('age', '15', {
            shouldValidate: true,
            shouldDirty: true,
        });

        await waitFor(() => {
            expect(result.current.fieldStore.getFieldSnapshot('age')?.warning).toBe('Age is high');
        });
    });

    it('evaluates section and feedback rule effects into non-field store', async () => {
        const metadata: ProgramStageMetadata = {
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
        };

        const { result } = renderHook(() => useEventForm({ programStageId: 'stage-1', metadata }));

        await waitFor(() => {
            expect(result.current.nonFieldStore.getSectionSnapshot('section-a')?.hidden).toBe(true);
            expect(result.current.nonFieldStore.getFeedbackSnapshot()['feedback:Note'].value).toBe(
                'Hidden section active'
            );
        });
    });
});
