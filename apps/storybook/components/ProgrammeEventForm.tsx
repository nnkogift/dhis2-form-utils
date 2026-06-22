import type { FieldControlInput } from '@dhis2-form-utils/hooks';
import type { Control } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import type { ComponentType } from 'react';
import { useEventFormStory } from '../decorators/withEventForm';

export type EventFormFieldProps = {
    field: Omit<FieldControlInput, 'control'>;
    control: Control<Record<string, string>>;
};

type ProgrammeEventFormProps = {
    Field: ComponentType<EventFormFieldProps>;
    submitLabel?: string;
};

export function ProgrammeEventForm({ Field, submitLabel = 'Save' }: ProgrammeEventFormProps) {
    const { control } = useFormContext<Record<string, string>>();
    const { submit, metadata } = useEventFormStory();

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                submit();
            }}
        >
            {(metadata.programStageDataElements ?? []).map((psde) => {
                const fieldId = psde.dataElement?.id;
                if (!fieldId) return null;

                return (
                    <Field
                        key={fieldId}
                        field={{ kind: 'dataElement', config: psde }}
                        control={control}
                    />
                );
            })}
            <button type="submit" style={{ marginTop: 16 }}>
                {submitLabel}
            </button>
        </form>
    );
}
