import { useDataQuery } from '@dhis2/app-runtime'
import {
    resolveEventProgramMetadata,
    type EventProgramMetadata,
    type ProgramMetadataExport,
} from '@dhis2-form-utils/metadata'
import { useMemo } from 'react'

type ProgramMetadataExportQueryResult = {
    programMetadata: ProgramMetadataExport
}

type EventProgramMetadataQueryResult = {
    program: EventProgramMetadata
}

export function useEventProgramMetadata(programId?: string) {
    const query = useMemo(
        () => ({
            programMetadata: {
                resource: 'programs',
                id: programId ? `${programId}/metadata` : undefined,
                params: {
                    skipSharing: true,
                },
            },
        }),
        [programId]
    )

    const result = useDataQuery<ProgramMetadataExportQueryResult>(query, {
        lazy: !programId,
    })

    const program = useMemo(() => {
        if (!programId || !result.data?.programMetadata) {
            return undefined
        }

        return resolveEventProgramMetadata(
            result.data.programMetadata,
            programId
        )
    }, [programId, result.data])

    return {
        ...result,
        data: program
            ? ({ program } satisfies EventProgramMetadataQueryResult)
            : undefined,
    }
}
