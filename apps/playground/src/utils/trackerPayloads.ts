import type { TrackerProgramMetadata } from '@dhis2-form-utils/hooks'

export type TrackerRegistrationValues = Record<string, string> & {
    orgUnit: string
    enrolledAt: string
    occurredAt?: string
}

export type EventFormValues = Record<string, string> & {
    orgUnit: string
    occurredAt: string
}

export const EVENT_SYSTEM_FIELD_KEYS = new Set(['orgUnit', 'occurredAt'])

export type EventSubmissionInput = {
    values: EventFormValues | Record<string, unknown>
    programId: string
    programStageId: string
}

export function buildEventPayload({
    values,
    programId,
    programStageId,
}: EventSubmissionInput) {
    const orgUnit = String(values.orgUnit ?? '')
    const occurredAt = String(values.occurredAt ?? '')
    const dataValues = Object.entries(values)
        .filter(
            ([fieldId, value]) =>
                !EVENT_SYSTEM_FIELD_KEYS.has(fieldId) &&
                value !== '' &&
                value !== null &&
                value !== undefined
        )
        .map(([dataElement, value]) => ({
            dataElement,
            value: String(value),
        }))

    return {
        events: [
            {
                program: programId,
                programStage: programStageId,
                orgUnit,
                occurredAt,
                status: 'ACTIVE' as const,
                dataValues,
            },
        ],
    }
}

export function buildTrackerRegistrationPayload({
    values,
    metadata,
    programId,
}: {
    values: TrackerRegistrationValues
    metadata: TrackerProgramMetadata
    programId: string
}) {
    const teaIds = new Set(
        metadata.programTrackedEntityAttributes.map(
            ({ trackedEntityAttribute }) => trackedEntityAttribute.id
        )
    )

    const attributes = Object.entries(values)
        .filter(
            ([fieldId, value]) =>
                teaIds.has(fieldId) &&
                value !== '' &&
                value !== null &&
                value !== undefined
        )
        .map(([attribute, value]) => ({
            attribute,
            value: String(value),
        }))

    return {
        trackedEntities: [
            {
                orgUnit: values.orgUnit,
                trackedEntityType: metadata.trackedEntityType.id,
                attributes,
                enrollments: [
                    {
                        program: programId,
                        orgUnit: values.orgUnit,
                        status: 'ACTIVE' as const,
                        enrolledAt: values.enrolledAt,
                        ...(metadata.displayIncidentDate && values.occurredAt
                            ? { occurredAt: values.occurredAt }
                            : {}),
                    },
                ],
            },
        ],
    }
}
