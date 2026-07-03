import i18n from '@dhis2/d2-i18n'
import { useFormState } from 'react-hook-form'
import type { OrgUnit } from '@/types/program'
import { FormDateField } from './FormDateField'
import { OrganisationUnitSelectField } from './OrganisationUnitSelectField'

type EventSystemFieldsProps = {
    orgUnits: OrgUnit[]
}

export function EventSystemFields({ orgUnits }: EventSystemFieldsProps) {
    const { isSubmitting } = useFormState()

    return (
        <>
            <OrganisationUnitSelectField
                name="orgUnit"
                label={i18n.t('Organisation unit')}
                orgUnits={orgUnits}
                disabled={isSubmitting}
            />
            <FormDateField
                name="occurredAt"
                label={i18n.t('Event date')}
                disabled={isSubmitting}
            />
        </>
    )
}
