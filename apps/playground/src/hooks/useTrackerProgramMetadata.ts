import { useDataQuery } from '@dhis2/app-runtime'
import {
    trackerProgramQueryFields,
    type TrackerProgramMetadata,
} from '@dhis2-form-utils/metadata'
import { useMemo } from 'react'

type RawProgramRuleVariable =
    TrackerProgramMetadata['programRuleVariables'][number] & {
        programStage?: { id: string }
    }

type RawTrackerProgram = Omit<
    TrackerProgramMetadata,
    | 'displayEnrollmentDateLabel'
    | 'displayIncidentDateLabel'
    | 'programRuleVariables'
> & {
    enrollmentDateLabel?: string
    incidentDateLabel?: string
    programRuleVariables: RawProgramRuleVariable[]
}

type TrackerProgramMetadataQueryResult = {
    program: RawTrackerProgram
}

export function useTrackerProgramMetadata(programId?: string) {
    const query = useMemo(
        () => ({
            program: {
                resource: 'programs',
                id: programId,
                params: {
                    fields: trackerProgramQueryFields,
                },
            },
        }),
        [programId]
    )

    const result = useDataQuery<TrackerProgramMetadataQueryResult>(query, {
        lazy: !programId,
    })

    const program = useMemo((): TrackerProgramMetadata | undefined => {
        const raw = result.data?.program
        if (!programId || !raw) {
            return undefined
        }

        const {
            enrollmentDateLabel,
            incidentDateLabel,
            programTrackedEntityAttributes,
            programRuleVariables,
            ...rest
        } = raw

        return {
            ...rest,
            displayEnrollmentDateLabel: enrollmentDateLabel,
            displayIncidentDateLabel: incidentDateLabel,
            programTrackedEntityAttributes: [
                ...programTrackedEntityAttributes,
            ].sort(
                (left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0)
            ),
            // Enrollment-scope rule variables only — stage-scoped variables belong to the event form.
            programRuleVariables: programRuleVariables.filter(
                (variable) => !variable.programStage?.id
            ),
        }
    }, [programId, result.data])

    return {
        ...result,
        data: program ? { program } : undefined,
    }
}
