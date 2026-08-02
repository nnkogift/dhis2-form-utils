import { useMemo, useRef, useState } from 'react'
import { useTrackerMetadataQuery } from '@dhis2-form-utils/hooks'
import type { EventProgramMetadata } from '@dhis2-form-utils/metadata'
import { EnrollmentRail } from '../EnrollmentRail'
import { slotKey, type TrackerSlot } from '../trackerSlot'
import { ProgramRegistrationFormScreen } from './ProgramRegistrationFormScreen'
import { ProgramStageFormScreen } from './ProgramStageFormScreen'

function createTodayValue() {
    return new Date().toISOString().slice(0, 10)
}

type TrackerProgramShellProps = {
    program: EventProgramMetadata
    programId: string
    orgUnitId: string
    enrolledAt: string
}

type RenderableStageSlot = { stageId: string; eventLocalId: string }

export function TrackerProgramShell({
    program,
    programId,
    orgUnitId,
    enrolledAt,
}: TrackerProgramShellProps) {
    const {
        metadata: trackerMetadata,
        loading: trackerLoading,
        error: trackerError,
    } = useTrackerMetadataQuery(programId)

    const [selectedSlot, setSelectedSlot] = useState<TrackerSlot>({
        kind: 'registration',
    })
    const [eventDraftsByStage, setEventDraftsByStage] = useState<
        Record<string, string[]>
    >({})
    const draftCounters = useRef<Record<string, number>>({})
    // Each stage event's default date is fixed at first render and cached here —
    // switching between events must not reset an already-open event's date field.
    const occurredAtByEvent = useRef<Record<string, string>>({})

    const handleAddEvent = (stageId: string) => {
        draftCounters.current[stageId] =
            (draftCounters.current[stageId] ?? 0) + 1
        const eventLocalId = `${stageId}-${draftCounters.current[stageId]}`

        setEventDraftsByStage((current) => ({
            ...current,
            [stageId]: [...(current[stageId] ?? []), eventLocalId],
        }))
        setSelectedSlot({ kind: 'stage', stageId, eventLocalId })
    }

    // Every stage/event combination renders as soon as it exists and stays mounted
    // (visibility toggled via CSS) rather than being destroyed on navigation — otherwise
    // switching rail rows would discard whatever the user had already typed into an event.
    const renderableStageSlots = useMemo<RenderableStageSlot[]>(() => {
        const slots: RenderableStageSlot[] = []
        for (const stage of program.programStages ?? []) {
            if (stage.repeatable) {
                for (const eventLocalId of eventDraftsByStage[stage.id] ?? []) {
                    slots.push({ stageId: stage.id, eventLocalId })
                }
            } else {
                slots.push({ stageId: stage.id, eventLocalId: 'primary' })
            }
        }
        return slots
    }, [program.programStages, eventDraftsByStage])

    return (
        <div className="flex min-h-0 flex-1 overflow-x-auto">
            <EnrollmentRail
                program={program}
                trackerMetadata={trackerMetadata}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
                eventDraftsByStage={eventDraftsByStage}
                onAddEvent={handleAddEvent}
            />
            <div
                className={
                    selectedSlot.kind === 'registration'
                        ? 'flex min-h-0 min-w-0 flex-1'
                        : 'hidden'
                }
            >
                <ProgramRegistrationFormScreen
                    programId={programId}
                    orgUnitId={orgUnitId}
                    enrolledAt={enrolledAt}
                    metadata={trackerMetadata}
                    programStages={program.programStages}
                    loading={trackerLoading}
                    error={trackerError}
                />
            </div>
            {renderableStageSlots.map((slot) => {
                const stageSlot: TrackerSlot = { kind: 'stage', ...slot }
                const key = slotKey(stageSlot)
                if (!occurredAtByEvent.current[key]) {
                    occurredAtByEvent.current[key] = createTodayValue()
                }
                const isSelected = slotKey(selectedSlot) === key

                return (
                    <div
                        key={key}
                        className={
                            isSelected
                                ? 'flex min-h-0 min-w-0 flex-1'
                                : 'hidden'
                        }
                    >
                        <ProgramStageFormScreen
                            program={program}
                            programStageId={slot.stageId}
                            orgUnitId={orgUnitId}
                            occurredAt={occurredAtByEvent.current[key]}
                        />
                    </div>
                )
            })}
        </div>
    )
}
