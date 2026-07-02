import type { ProgramListParams, ProgramTypeFilter } from '@/types/program'

/** Matches @dhis2/ui Pagination default `pageSizes` options. */
export const PAGE_SIZE_OPTIONS = [
    '5',
    '10',
    '20',
    '30',
    '40',
    '50',
    '75',
    '100',
] as const

export const DEFAULT_PAGE_SIZE = 10

export function parsePageSize(value: string | null): number {
    const parsed = Number(value)

    if (
        Number.isFinite(parsed) &&
        PAGE_SIZE_OPTIONS.includes(
            String(parsed) as (typeof PAGE_SIZE_OPTIONS)[number]
        )
    ) {
        return parsed
    }

    return DEFAULT_PAGE_SIZE
}

export function parseProgramTypeFilter(
    value: string | null
): ProgramTypeFilter {
    if (value === 'registration' || value === 'event') {
        return value
    }
    return 'all'
}

export function buildProgramListUrl(
    params: Partial<ProgramListParams>
): string {
    const searchParams = new URLSearchParams()

    if (params.search) {
        searchParams.set('search', params.search)
    }

    if (params.type && params.type !== 'all') {
        searchParams.set('type', params.type)
    }

    if (params.page && params.page > 1) {
        searchParams.set('page', String(params.page))
    }

    if (params.pageSize && params.pageSize !== DEFAULT_PAGE_SIZE) {
        searchParams.set('pageSize', String(params.pageSize))
    }

    const query = searchParams.toString()
    return query ? `/?${query}` : '/'
}
