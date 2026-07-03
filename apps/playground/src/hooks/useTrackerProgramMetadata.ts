import { useDataQuery } from '@dhis2/app-runtime'
import type { TrackerProgramMetadata } from '@dhis2-form-utils/hooks'
import { useMemo } from 'react'

type TrackerProgramMetadataQueryResult = {
    program: TrackerProgramMetadata
}

const TRACKER_PROGRAM_METADATA_FIELDS = [
    'id',
    'displayName',
    'trackedEntityType[id]',
    'displayIncidentDate',
    'selectEnrollmentDatesInFuture',
    'selectIncidentDatesInFuture',
    'displayEnrollmentDateLabel',
    'displayIncidentDateLabel',
    'programTrackedEntityAttributes[' +
        [
            'id',
            'mandatory',
            'allowFutureDate',
            'searchable',
            'displayInList',
            'sortOrder',
            'renderType',
            'renderOptionsAsRadio',
            'trackedEntityAttribute[' +
                [
                    'id',
                    'displayName',
                    'formName',
                    'valueType',
                    'optionSet[id,options[id,code,displayName]]',
                    'unique',
                    'generated',
                    'fieldMask',
                    'confidential',
                    'orgunitScope',
                ].join(',') +
                ']',
        ].join(',') +
        ']',
    'programRules[' +
        [
            'id',
            'name',
            'condition',
            'priority',
            'programStage[id]',
            'programRuleActions[' +
                [
                    'id',
                    'programRuleActionType',
                    'data',
                    'content',
                    'location',
                    'trackedEntityAttribute[id]',
                    'programStageSection[id]',
                ].join(',') +
                ']',
        ].join(',') +
        ']',
    'programRuleVariables[' +
        [
            'id',
            'name',
            'programRuleVariableSourceType',
            'trackedEntityAttribute[id]',
            'valueType',
            'useCodeForOptionSet',
        ].join(',') +
        ']',
    'programSections[id,displayName,sortOrder,trackedEntityAttributes[id]]',
].join(',')

export function useTrackerProgramMetadata(programId?: string) {
    const query = useMemo(
        () => ({
            program: {
                resource: 'programs',
                id: programId,
                params: {
                    fields: TRACKER_PROGRAM_METADATA_FIELDS,
                },
            },
        }),
        [programId]
    )

    return useDataQuery<TrackerProgramMetadataQueryResult>(query, {
        lazy: !programId,
    })
}
