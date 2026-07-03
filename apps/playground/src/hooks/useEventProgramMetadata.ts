import { useDataQuery } from '@dhis2/app-runtime'
import { programStageQuery } from '@dhis2-form-utils/hooks'
import type { ProgramStageMetadata } from '@dhis2-form-utils/metadata'

type EventProgramMetadataQueryResult = {
    programStage: ProgramStageMetadata
}

export function useEventProgramMetadata(programStageId?: string) {
    return useDataQuery<EventProgramMetadataQueryResult>(
        programStageQuery(programStageId ?? ''),
        {
            lazy: !programStageId,
        }
    )
}
