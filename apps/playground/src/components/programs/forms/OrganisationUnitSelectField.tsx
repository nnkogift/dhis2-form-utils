import i18n from '@dhis2/d2-i18n'
import { SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import { useController } from 'react-hook-form'
import type { OrgUnit } from '@/types/program'

type OrganisationUnitSelectFieldProps = {
    name: string
    label: string
    orgUnits: OrgUnit[]
    helpText?: string
    disabled?: boolean
}

export function OrganisationUnitSelectField({
    name,
    label,
    orgUnits,
    helpText,
    disabled = false,
}: OrganisationUnitSelectFieldProps) {
    const { field, fieldState } = useController({
        name,
        rules: {
            required: i18n.t('Organisation unit is required'),
        },
    })

    return (
        <SingleSelectField
            label={label}
            helpText={helpText}
            selected={String(field.value ?? '')}
            disabled={disabled}
            error={Boolean(fieldState.error)}
            validationText={fieldState.error?.message}
            onChange={({ selected }) => {
                field.onChange(selected ?? '')
            }}
            onBlur={field.onBlur}
        >
            {orgUnits.map((orgUnit) => (
                <SingleSelectOption
                    key={orgUnit.id}
                    label={orgUnit.displayName}
                    value={orgUnit.id}
                />
            ))}
        </SingleSelectField>
    )
}
