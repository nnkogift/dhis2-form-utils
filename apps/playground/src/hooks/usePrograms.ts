import { useDataQuery } from '@dhis2/app-runtime'
import { useMemo } from 'react'
import { buildProgramFilters } from '@/hooks/buildProgramFilters'
import type { ProgramTypeFilter, ProgramsResponse } from '@/types/program'

type UseProgramsOptions = {
    page: number
    pageSize: number
    search: string
    type: ProgramTypeFilter
}

type ProgramsQueryResult = {
    programs: ProgramsResponse
}

export function usePrograms({
    page,
    pageSize,
    search,
    type,
}: UseProgramsOptions) {
    const query = useMemo(() => {
        const filters = buildProgramFilters(search, type)

        return {
            programs: {
                resource: 'programs',
                params: {
                    fields: 'id,displayName,code,shortName,programType',
                    order: 'displayName:asc',
                    page,
                    pageSize,
                    ...(filters.length > 0 ? { filter: filters } : {}),
                },
            },
        }
    }, [page, pageSize, search, type])

    return useDataQuery<ProgramsQueryResult>(query)
}
