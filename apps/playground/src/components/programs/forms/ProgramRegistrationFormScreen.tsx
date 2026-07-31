import i18n from '@dhis2/d2-i18n'
import { Center, CircularLoader, NoticeBox } from '@dhis2/ui'
import { useTrackerMetadataQuery } from '@dhis2-form-utils/hooks'
import type { OrgUnit } from '@/types/program'
import { ProgramRegistrationForm } from './ProgramRegistrationForm'

type ProgramRegistrationFormScreenProps = {
    programId: string
    orgUnits: OrgUnit[]
}

export function ProgramRegistrationFormScreen({
    programId,
    orgUnits,
}: ProgramRegistrationFormScreenProps) {
    const { metadata, error, loading } = useTrackerMetadataQuery(programId)

    if (loading) {
        return (
            <Center>
                <CircularLoader />
            </Center>
        )
    }

    if (error || !metadata) {
        return (
            <NoticeBox error title={i18n.t('Could not load registration form')}>
                {i18n.t('The tracker program metadata could not be loaded.')}
            </NoticeBox>
        )
    }

    if (metadata.programTrackedEntityAttributes.length === 0) {
        return (
            <NoticeBox title={i18n.t('No attributes configured')}>
                {i18n.t(
                    'This tracker program does not expose any tracked entity attributes to capture.'
                )}
            </NoticeBox>
        )
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <ProgramRegistrationForm
                programId={programId}
                metadata={metadata}
                orgUnits={orgUnits}
            />
        </div>
    )
}
