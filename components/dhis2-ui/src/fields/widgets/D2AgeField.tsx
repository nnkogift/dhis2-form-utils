import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { computeAgeFromDob } from '@nnkogift/dhis2-form-utils-hooks';
import { D2DateField } from './D2DateField';

export function D2AgeField({ control }: WidgetProps) {
    const age = computeAgeFromDob(control.field.value as string);
    const helpText = [control.fieldConfig.description, age ? `Age: ${age} years` : undefined]
        .filter(Boolean)
        .join(' · ');

    return (
        <D2DateField
            control={{
                ...control,
                fieldConfig: {
                    ...control.fieldConfig,
                    description: helpText || control.fieldConfig.description,
                },
            }}
        />
    );
}
