import type { ProgramTypeFilter } from '@/types/program'

export function programTypeFilterToApi(
    type: ProgramTypeFilter
): string | undefined {
    if (type === 'registration') {
        return 'WITH_REGISTRATION'
    }
    if (type === 'event') {
        return 'WITHOUT_REGISTRATION'
    }
    return undefined
}

export function buildProgramFilters(
    search: string,
    type: ProgramTypeFilter
): string[] {
    const filters: string[] = []
    const trimmedSearch = search.trim()

    if (trimmedSearch) {
        filters.push(`identifiable:token:${trimmedSearch}`)
    }

    const programType = programTypeFilterToApi(type)
    if (programType) {
        filters.push(`programType:eq:${programType}`)
    }

    return filters
}
