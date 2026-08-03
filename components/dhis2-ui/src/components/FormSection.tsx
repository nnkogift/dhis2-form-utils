import { useSectionState } from '@dhis2-form-utils/hooks';
import type { ReactNode } from 'react';

export type FormSectionProps = {
    sectionId: string;
    children: ReactNode;
};

export function FormSection({ sectionId, children }: FormSectionProps) {
    const state = useSectionState(sectionId);

    if (state.hidden) {
        return null;
    }

    return <>{children}</>;
}
