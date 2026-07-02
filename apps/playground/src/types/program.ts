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
