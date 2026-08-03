import type { FieldControlInput } from '@dhis2-form-utils/hooks';
import type { ProgramTrackedEntityAttribute } from '@dhis2-form-utils/metadata';
import { useFormContext } from 'react-hook-form';
import type { ComponentType } from 'react';
import { useTrackerFormStory } from '../decorators/withTrackerForm';

export type RegistrationFormFieldProps = {
    field: FieldControlInput;
};

type ProgrammeRegistrationFormProps = {
    Field: ComponentType<RegistrationFormFieldProps>;
    submitLabel?: string;
};

const fieldStyle = { display: 'block', marginBottom: 16 } as const;
const labelStyle = { display: 'block', marginBottom: 4, fontWeight: 500 } as const;
const inputStyle = { width: '100%', padding: '6px 8px' } as const;

export function ProgrammeRegistrationForm({
    Field,
    submitLabel = 'Register',
}: ProgrammeRegistrationFormProps) {
    const { handleSubmit, register } = useFormContext<Record<string, string>>();
    const { metadata } = useTrackerFormStory();

    return (
        <form
            onSubmit={(event) => {
                void handleSubmit((values) => {
                    void values;
                })(event);
            }}
        >
            <div style={fieldStyle}>
                <label style={labelStyle} htmlFor="orgUnit">
                    Organisation unit
                </label>
                <input id="orgUnit" style={inputStyle} {...register('orgUnit')} />
            </div>

            <div style={fieldStyle}>
                <label style={labelStyle} htmlFor="enrolledAt">
                    {metadata.displayEnrollmentDateLabel ?? 'Date of enrollment'}
                </label>
                <input id="enrolledAt" type="date" style={inputStyle} {...register('enrolledAt')} />
            </div>

            {metadata.displayIncidentDate ? (
                <div style={fieldStyle}>
                    <label style={labelStyle} htmlFor="occurredAt">
                        {metadata.displayIncidentDateLabel ?? 'Date of birth'}
                    </label>
                    <input
                        id="occurredAt"
                        type="date"
                        style={inputStyle}
                        {...register('occurredAt')}
                    />
                </div>
            ) : null}

            {metadata.programTrackedEntityAttributes.map((ptea) => {
                const fieldId = ptea.trackedEntityAttribute?.id;
                if (!fieldId) return null;

                return (
                    <Field
                        key={fieldId}
                        field={{
                            kind: 'trackedEntityAttribute',
                            config: ptea as ProgramTrackedEntityAttribute,
                        }}
                    />
                );
            })}

            <button type="submit" style={{ marginTop: 16 }}>
                {submitLabel}
            </button>
        </form>
    );
}
