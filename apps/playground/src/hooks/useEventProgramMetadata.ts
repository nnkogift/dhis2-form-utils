import { useDataQuery } from '@dhis2/app-runtime'
import {
    eventProgramQueryFields,
    type EventProgramMetadata,
} from '@dhis2-form-utils/metadata'
import { useMemo } from 'react'

type EventProgramMetadataQueryResult = {
    program: EventProgramMetadata
}

export function useEventProgramMetadata(programId?: string) {
    const query = useMemo(
        () => ({
            program: {
                resource: 'programs',
                id: programId,
                params: {
                    fields: eventProgramQueryFields,
                },
            },
        }),
        [programId]
    )

    return useDataQuery<EventProgramMetadataQueryResult>(query, {
        lazy: !programId,
    })
}
