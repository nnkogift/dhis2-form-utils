import { useCallback, useMemo, useRef, useState } from 'react'
import { useTrackerMetadataQuery } from '@nnkogift/dhis2-form-utils-hooks'
import type {
    EventProgramMetadata,
    OptionGroupCodeMap,
} from '@nnkogift/dhis2-form-utils-metadata'
import type {
    RuleEventInput,
    RuleSupplementaryDataInput,
} from '@nnkogift/dhis2-form-utils-rules'
import { EVENT_SYSTEM_FIELD_KEYS } from '@/utils/trackerPayloads'
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
    supplementaryData?: RuleSupplementaryDataInput
    optionGroups?: OptionGroupCodeMap
}

type RenderableStageSlot = { stageId: string; eventLocalId: string }

const EMPTY_EVENTS: RuleEventInput[] = []

function toRuleEventInput(
    slot: RenderableStageSlot,
    key: string,
    values: Record<string, unknown>
): RuleEventInput {
    const dataValues = Object.fromEntries(
        Object.entries(values).filter(
            ([field]) => !EVENT_SYSTEM_FIELD_KEYS.has(field)
        )
    )

    return {
        event: key,
        programStage: slot.stageId,
        orgUnit:
            typeof values.orgUnit === 'string' ? values.orgUnit : undefined,
        eventDate:
            typeof values.occurredAt === 'string' ? values.occurredAt : null,
        dataValues,
    }
}

export function TrackerProgramShell({
    program,
    programId,
    orgUnitId,
    enrolledAt,
    supplementaryData,
    optionGroups,
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

    // Live cross-form sync: each form pushes its current values here (debounced) via
    // usePublishFormValues, so sibling forms can see them as `enrollment`/`events` inputs.
    const [registrationValues, setRegistrationValues] =
        useState<Record<string, unknown>>()
    const [eventValuesBySlot, setEventValuesBySlot] = useState<
        Record<string, Record<string, unknown>>
    >({})
    const handleRegistrationValuesChange = useCallback(
        (values: Record<string, unknown>) => {
            setRegistrationValues(values)
        },
        []
    )
    const handleEventValuesChange = useCallback(
        (key: string, values: Record<string, unknown>) => {
            setEventValuesBySlot((current) => ({ ...current, [key]: values }))
        },
        []
    )
    // Cached per-slot so `onValuesChange` keeps a stable reference across renders —
    // an inline arrow here would resubscribe usePublishFormValues every render.
    const eventValuesChangeHandlers = useRef(
        new Map<string, (values: Record<string, unknown>) => void>()
    )
    const getEventValuesChangeHandler = (key: string) => {
        const cache = eventValuesChangeHandlers.current
        let handler = cache.get(key)
        if (!handler) {
            handler = (values: Record<string, unknown>) =>
                handleEventValuesChange(key, values)
            cache.set(key, handler)
        }
        return handler
    }

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

    const enrollment = useMemo(
        () =>
            trackerMetadata
                ? {
                      metadata: trackerMetadata,
                      values: registrationValues ?? {},
                  }
                : undefined,
        [trackerMetadata, registrationValues]
    )

    const allEvents = useMemo(
        () =>
            renderableStageSlots.flatMap((slot) => {
                const key = slotKey({ kind: 'stage', ...slot })
                const values = eventValuesBySlot[key]
                return values ? [toRuleEventInput(slot, key, values)] : []
            }),
        [renderableStageSlots, eventValuesBySlot]
    )

    // Precomputed once per `allEvents` change so each stage form gets a stable
    // `events` array reference — filtering inline in the JSX below would create a
    // new array every render and force useEventForm to reinit on every render.
    const eventsExcludingSlot = useMemo(() => {
        const map = new Map<string, RuleEventInput[]>()
        for (const slot of renderableStageSlots) {
            const key = slotKey({ kind: 'stage', ...slot })
            map.set(
                key,
                allEvents.filter((event) => event.event !== key)
            )
        }
        return map
    }, [renderableStageSlots, allEvents])

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
                    events={allEvents}
                    supplementaryData={supplementaryData}
                    optionGroups={optionGroups}
                    onValuesChange={handleRegistrationValuesChange}
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
                            enrollment={enrollment}
                            events={
                                eventsExcludingSlot.get(key) ?? EMPTY_EVENTS
                            }
                            supplementaryData={supplementaryData}
                            optionGroups={optionGroups}
                            onValuesChange={getEventValuesChangeHandler(key)}
                        />
                    </div>
                )
            })}
        </div>
    )
}
