import type { FieldControlInput } from '@dhis2-form-utils/hooks';
import { useFormContext } from 'react-hook-form';
import type { ComponentType } from 'react';
import { useEventFormStory } from '../decorators/withEventForm';

export type EventFormFieldProps = {
    field: FieldControlInput;
};

type ProgrammeEventFormProps = {
    Field: ComponentType<EventFormFieldProps>;
    submitLabel?: string;
};

export function ProgrammeEventForm({ Field, submitLabel = 'Save' }: ProgrammeEventFormProps) {
    const { handleSubmit } = useFormContext<Record<string, string>>();
    const { metadata } = useEventFormStory();

    return (
        <form
            onSubmit={(event) => {
                void handleSubmit((values) => {
                    void values;
                })(event);
            }}
        >
            {(metadata.programStageDataElements ?? []).map((psde) => {
                const fieldId = psde.dataElement?.id;
                if (!fieldId) return null;

                return <Field key={fieldId} field={{ kind: 'dataElement', config: psde }} />;
            })}
            <button type="submit" style={{ marginTop: 16 }}>
                {submitLabel}
            </button>
        </form>
    );
}
