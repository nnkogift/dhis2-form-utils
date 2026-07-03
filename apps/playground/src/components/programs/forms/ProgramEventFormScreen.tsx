import i18n from '@dhis2/d2-i18n'
import type { EventProgramMetadata } from '@dhis2-form-utils/metadata'
import { selectProgramStage } from '@dhis2-form-utils/metadata'
import type { OrgUnit } from '@/types/program'
import { ProgramEventForm } from './ProgramEventForm'

type ProgramEventFormScreenProps = {
    program: EventProgramMetadata
    orgUnits: OrgUnit[]
}

export function ProgramEventFormScreen({
    program,
    orgUnits,
}: ProgramEventFormScreenProps) {
    const programStageId = program.programStages?.[0]?.id
    const stageMetadata = programStageId
        ? selectProgramStage(program, programStageId)
        : undefined

    if (!programStageId || !stageMetadata) {
        return (
            <div className="text-dhis2-grey-700">
                {i18n.t(
                    'This event program does not have a program stage to render.'
                )}
            </div>
        )
    }

    return (
        <ProgramEventForm
            program={program}
            stageMetadata={stageMetadata}
            programStageId={programStageId}
            orgUnits={orgUnits}
        />
    )
}
