import { useDataQuery } from '@dhis2/app-runtime'
import { useMemo } from 'react'
import type { ProgramHeader } from '@/types/program'

type ProgramHeaderQueryResult = {
    program: ProgramHeader
}

const PROGRAM_HEADER_FIELDS = [
    'id',
    'displayName',
    'code',
    'shortName',
    'programType',
    'trackedEntityType[id]',
    'displayIncidentDate',
    'selectEnrollmentDatesInFuture',
    'selectIncidentDatesInFuture',
    'displayEnrollmentDateLabel',
    'displayIncidentDateLabel',
    'programStages[id,displayName]',
    'programSections[id,displayName,sortOrder,trackedEntityAttributes[id]]',
].join(',')

export function useProgramHeader(programId?: string) {
    const query = useMemo(
        () => ({
            program: {
                resource: 'programs',
                id: programId,
                params: {
                    fields: PROGRAM_HEADER_FIELDS,
                },
            },
        }),
        [programId]
    )

    return useDataQuery<ProgramHeaderQueryResult>(query, {
        lazy: !programId,
    })
}
