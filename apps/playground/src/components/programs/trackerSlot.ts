export type TrackerSlot =
    | { kind: 'registration' }
    | { kind: 'stage'; stageId: string; eventLocalId: string }

export function slotKey(slot: TrackerSlot): string {
    return slot.kind === 'registration'
        ? 'registration'
        : `${slot.stageId}:${slot.eventLocalId}`
}
