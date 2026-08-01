import type { Program, ProgramType } from '@/types/program'

export type RawProgramListItem = {
    id: string
    displayName: string
    code: string
    shortName: string
    programType: ProgramType
    lastUpdated?: string
    programStages?: Array<{ id: string }>
    programRules?: Array<{ id: string }>
}

export function resolveProgramListItem(raw: RawProgramListItem): Program {
    return {
        id: raw.id,
        displayName: raw.displayName,
        code: raw.code,
        shortName: raw.shortName,
        programType: raw.programType,
        lastUpdated: raw.lastUpdated ?? '',
        stageCount: raw.programStages?.length ?? 0,
        ruleCount: raw.programRules?.length ?? 0,
    }
}
