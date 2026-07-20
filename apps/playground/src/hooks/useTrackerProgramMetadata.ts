import { useDataQuery } from '@dhis2/app-runtime'
import type { TrackerProgramMetadata } from '@dhis2-form-utils/hooks'
import {
    resolveTrackerProgramMetadata,
    type ProgramMetadataExport,
} from '@dhis2-form-utils/metadata'
import { useMemo } from 'react'

type ProgramMetadataExportQueryResult = {
    programMetadata: ProgramMetadataExport
}

type TrackerProgramMetadataQueryResult = {
    program: TrackerProgramMetadata
}

export function useTrackerProgramMetadata(programId?: string) {
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

        return resolveTrackerProgramMetadata(
            result.data.programMetadata,
            programId
        )
    }, [programId, result.data])

    return {
        ...result,
        data: program
            ? ({ program } satisfies TrackerProgramMetadataQueryResult)
            : undefined,
    }
}
