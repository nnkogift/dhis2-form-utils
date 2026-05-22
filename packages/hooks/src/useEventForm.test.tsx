import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ProgramStageMetadata } from '@dhis2-form-utils/metadata';
import { useEventForm } from './useEventForm';

vi.mock('@dhis2/app-runtime', () => ({
    useDataQuery: () => ({
        data: undefined,
        loading: false,
    }),
}));

describe('useEventForm', () => {
    it('returns form, fieldState, isLoading, and submit', () => {
        const { result } = renderHook(() => useEventForm());

        expect(result.current.form).toBeDefined();
        expect(result.current.fieldState).toBeDefined();
        expect(result.current.isLoading).toBe(false);
        expect(typeof result.current.submit).toBe('function');
    });

    it('accepts custom metadata', () => {
        const metadata = {
            id: 'custom',
            displayName: 'Custom',
            programStageDataElements: [
                {
                    dataElement: {
                        id: 'customField',
                        displayName: 'Custom',
                        valueType: 'TEXT' as const,
                    },
                },
            ],
        };

        const { result } = renderHook(() => useEventForm({ metadata }));
        expect(result.current.form).toBeDefined();
    });

    it('reactively evaluates rules into fieldState', async () => {
        const metadata: ProgramStageMetadata = {
            id: 'stage-rules',
            displayName: 'Rule Stage',
            programStageDataElements: [
                {
                    dataElement: {
                        id: 'age',
                        displayName: 'Age',
                        valueType: 'INTEGER',
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
                            programRuleActionType: 'SHOWWARNING',
                            content: 'Age is high',
                            dataElement: {
                                id: 'age',
                                displayName: 'Age',
                                valueType: 'INTEGER',
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
                        valueType: 'INTEGER',
                    },
                    programRuleVariableSourceType: 'DATAELEMENT_CURRENT_EVENT',
                },
            ],
        };

        const { result } = renderHook(() => useEventForm({ metadata }));

        result.current.form.setValue('age', 15, {
            shouldValidate: true,
            shouldDirty: true,
        });

        await waitFor(() => {
            expect(result.current.fieldState.age.warning).toBe('Age is high');
        });
    });
});
