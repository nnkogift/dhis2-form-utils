import i18n from '@dhis2/d2-i18n'
import { useFormState } from 'react-hook-form'
import type { TrackerProgramMetadata } from '@dhis2-form-utils/hooks'
import type { OrgUnit } from '@/types/program'
import { FormDateField } from './FormDateField'
import { OrganisationUnitSelectField } from './OrganisationUnitSelectField'

type TrackerSystemFieldsProps = {
    metadata: TrackerProgramMetadata
    orgUnits: OrgUnit[]
}

export function TrackerSystemFields({
    metadata,
    orgUnits,
}: TrackerSystemFieldsProps) {
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
                name="enrolledAt"
                label={
                    metadata.displayEnrollmentDateLabel ??
                    i18n.t('Date of enrollment')
                }
                disabled={isSubmitting}
            />
            {metadata.displayIncidentDate ? (
                <FormDateField
                    name="occurredAt"
                    label={
                        metadata.displayIncidentDateLabel ??
                        i18n.t('Incident date')
                    }
                    disabled={isSubmitting}
                />
            ) : null}
        </>
    )
}
