import type { ReactNode } from 'react'
import i18n from '@dhis2/d2-i18n'
import {
    IconAdd16,
    IconFileDocument16,
    IconQueue16,
    IconUser16,
} from '@dhis2/ui'
import type { TrackerProgramMetadata } from '@nnkogift/dhis2-form-utils-hooks'
import type { EventProgramMetadata } from '@nnkogift/dhis2-form-utils-metadata'
import type { TrackerSlot } from './trackerSlot'
import { slotKey } from './trackerSlot'

type EnrollmentRailProps = {
    program: EventProgramMetadata
    trackerMetadata: TrackerProgramMetadata | undefined
    selectedSlot: TrackerSlot
    onSelectSlot: (slot: TrackerSlot) => void
    eventDraftsByStage: Record<string, string[]>
    onAddEvent: (stageId: string) => void
}

function RailRow({
    icon,
    label,
    meta,
    indent = false,
    selected,
    onClick,
}: {
    icon?: ReactNode
    label: string
    meta: string
    indent?: boolean
    selected: boolean
    onClick: () => void
}) {
    return (
        <div
            role="button"
            tabIndex={0}
            aria-current={selected ? 'true' : undefined}
            onClick={onClick}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onClick()
                }
            }}
            className={`relative flex cursor-pointer flex-col gap-1 py-2.5 ${
                indent ? 'pl-11 pr-4' : 'pl-[19px] pr-4'
            } ${selected ? 'bg-dhis2-teal-100' : ''}`}
        >
            <div
                className={`absolute inset-y-0 left-0 w-[3px] ${
                    selected ? 'bg-dhis2-teal-600' : 'bg-transparent'
                }`}
            />
            <div className="flex min-w-0 items-center gap-2">
                {icon ? (
                    <span
                        className={
                            selected
                                ? 'shrink-0 text-dhis2-teal-600'
                                : 'shrink-0 text-dhis2-grey-600'
                        }
                    >
                        {icon}
                    </span>
                ) : null}
                <span
                    className={`min-w-0 truncate text-sm font-medium leading-5 ${
                        selected ? 'text-dhis2-teal-900' : 'text-dhis2-grey-800'
                    }`}
                >
                    {label}
                </span>
            </div>
            <div className={indent ? 'pl-0' : 'pl-6'}>
                <span className="text-xs text-dhis2-grey-600">{meta}</span>
            </div>
        </div>
    )
}

export function EnrollmentRail({
    program,
    trackerMetadata,
    selectedSlot,
    onSelectSlot,
    eventDraftsByStage,
    onAddEvent,
}: EnrollmentRailProps) {
    const stages = [...(program.programStages ?? [])].sort(
        (left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0)
    )
    const selectedKey = slotKey(selectedSlot)
    const selectedStageId =
        selectedSlot.kind === 'stage' ? selectedSlot.stageId : null
    const selectedStage = stages.find((stage) => stage.id === selectedStageId)
    const canAddEvent = Boolean(selectedStage?.repeatable)

    return (
        <nav
            className="flex w-[268px] shrink-0 flex-col overflow-auto border-r border-dhis2-grey-300 bg-dhis2-grey-100"
            aria-label={i18n.t('Enrollment')}
        >
            <div className="px-4 pb-2 pt-3.5">
                <span className="text-[11px] font-bold uppercase tracking-[.09em] text-dhis2-grey-600">
                    {i18n.t('Enrollment')}
                </span>
            </div>
            <div className="flex flex-col">
                <RailRow
                    icon={<IconUser16 />}
                    label={i18n.t('Registration')}
                    meta={i18n.t('{{count}} attributes', {
                        count:
                            trackerMetadata?.programTrackedEntityAttributes
                                .length ?? 0,
                    })}
                    selected={selectedKey === slotKey({ kind: 'registration' })}
                    onClick={() => {
                        onSelectSlot({ kind: 'registration' })
                    }}
                />
                {stages.map((stage) => {
                    const drafts = eventDraftsByStage[stage.id] ?? []

                    if (!stage.repeatable) {
                        const slot: TrackerSlot = {
                            kind: 'stage',
                            stageId: stage.id,
                            eventLocalId: 'primary',
                        }
                        return (
                            <RailRow
                                key={stage.id}
                                icon={<IconFileDocument16 />}
                                label={stage.displayName}
                                meta={i18n.t('1 event')}
                                selected={selectedKey === slotKey(slot)}
                                onClick={() => {
                                    onSelectSlot(slot)
                                }}
                            />
                        )
                    }

                    return (
                        <div key={stage.id} className="flex flex-col">
                            <RailRow
                                icon={<IconQueue16 />}
                                label={stage.displayName}
                                meta={
                                    drafts.length === 1
                                        ? i18n.t('1 event')
                                        : i18n.t('{{count}} events', {
                                              count: drafts.length,
                                          })
                                }
                                selected={
                                    selectedStageId === stage.id &&
                                    drafts.length === 0
                                }
                                onClick={() => {
                                    if (drafts.length === 0) {
                                        onAddEvent(stage.id)
                                        return
                                    }
                                    onSelectSlot({
                                        kind: 'stage',
                                        stageId: stage.id,
                                        eventLocalId: drafts[0],
                                    })
                                }}
                            />
                            {drafts.map((eventLocalId, index) => {
                                const slot: TrackerSlot = {
                                    kind: 'stage',
                                    stageId: stage.id,
                                    eventLocalId,
                                }
                                return (
                                    <RailRow
                                        key={eventLocalId}
                                        label={i18n.t('Event {{number}}', {
                                            number: index + 1,
                                        })}
                                        meta=""
                                        indent
                                        selected={selectedKey === slotKey(slot)}
                                        onClick={() => {
                                            onSelectSlot(slot)
                                        }}
                                    />
                                )
                            })}
                        </div>
                    )
                })}
            </div>
            <div className="mt-2 flex flex-col gap-2 border-t border-dhis2-grey-300 px-4 pb-3.5 pt-2">
                <button
                    type="button"
                    disabled={!canAddEvent}
                    onClick={() => {
                        if (selectedStageId) {
                            onAddEvent(selectedStageId)
                        }
                    }}
                    className="flex h-8 items-center justify-center gap-1.5 rounded bg-white text-[13px] shadow-[inset_0_0_0_1px_#a0adba] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <IconAdd16 aria-hidden="true" />
                    {i18n.t('Add event')}
                </button>
                <p className="m-0 text-xs leading-normal text-dhis2-grey-600">
                    {i18n.t(
                        'Repeatable stages accept more than one event, so you can test rules that compare across events.'
                    )}
                </p>
            </div>
        </nav>
    )
}
