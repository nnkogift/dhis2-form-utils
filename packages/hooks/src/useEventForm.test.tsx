import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useEventForm } from './useEventForm';

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
});
