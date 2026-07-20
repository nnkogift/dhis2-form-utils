export const PROGRAM_TYPE = {
    WITH_REGISTRATION: 'WITH_REGISTRATION',
    WITHOUT_REGISTRATION: 'WITHOUT_REGISTRATION',
} as const

export type ProgramType = (typeof PROGRAM_TYPE)[keyof typeof PROGRAM_TYPE]

export type Program = {
    id: string
    displayName: string
    code: string
    shortName: string
    programType: ProgramType
}

export type ProgramStageSummary = {
    id: string
    displayName: string
}

export type ProgramSection = {
    id: string
    displayName?: string
    sortOrder?: number
    trackedEntityAttributes: Array<{ id: string }>
}

export type ProgramHeader = Program & {
    trackedEntityType?: { id: string }
    displayIncidentDate?: boolean
    selectEnrollmentDatesInFuture?: boolean
    selectIncidentDatesInFuture?: boolean
    displayEnrollmentDateLabel?: string
    displayIncidentDateLabel?: string
    programStages?: ProgramStageSummary[]
    programSections?: ProgramSection[]
}

export type Pager = {
    page: number
    pageCount: number
    total: number
    pageSize: number
}

export type ProgramsResponse = {
    programs: Program[]
    pager: Pager
}

export type ProgramTypeFilter = 'all' | 'registration' | 'event'

export type ProgramListParams = {
    search: string
    type: ProgramTypeFilter
    page: number
    pageSize: number
}

export type OrgUnit = {
    id: string
    displayName: string
}
