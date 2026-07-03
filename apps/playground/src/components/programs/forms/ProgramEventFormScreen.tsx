import i18n from '@dhis2/d2-i18n'
import { Center, CircularLoader, NoticeBox } from '@dhis2/ui'
import { useEventProgramMetadata } from '@/hooks/useEventProgramMetadata'
import type { OrgUnit, ProgramHeader } from '@/types/program'
import { ProgramEventForm } from './ProgramEventForm'

type ProgramEventFormScreenProps = {
    program: ProgramHeader
    orgUnits: OrgUnit[]
}

export function ProgramEventFormScreen({
    program,
    orgUnits,
}: ProgramEventFormScreenProps) {
    const programStageId = program.programStages?.[0]?.id
    const { data, error, loading } = useEventProgramMetadata(programStageId)

    if (!programStageId) {
        return (
            <NoticeBox error title={i18n.t('No program stage available')}>
                {i18n.t(
                    'This event program does not have a program stage to render.'
                )}
            </NoticeBox>
        )
    }

    if (loading) {
        return (
            <Center>
                <CircularLoader />
            </Center>
        )
    }

    if (error || !data?.programStage) {
        return (
            <NoticeBox error title={i18n.t('Could not load event form')}>
                {i18n.t('The event program metadata could not be loaded.')}
            </NoticeBox>
        )
    }

    console.log(data)

    return (
        <ProgramEventForm
            program={program}
            metadata={data.programStage}
            programStageId={programStageId}
            orgUnits={orgUnits}
        />
    )
}
