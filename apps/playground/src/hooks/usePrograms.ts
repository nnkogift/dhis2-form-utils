import { useDataQuery } from '@dhis2/app-runtime'
import { useEffect, useMemo } from 'react'
import { buildProgramFilters } from '@/hooks/buildProgramFilters'
import type { RawProgramListItem } from '@/utils/resolveProgramListItem'
import type { Pager, ProgramTypeFilter } from '@/types/program'

type UseProgramsOptions = {
    page: number
    pageSize: number
    search: string
    type: ProgramTypeFilter
}

type ProgramsQueryResult = {
    programs: {
        programs: RawProgramListItem[]
        pager: Pager
    }
}

export function usePrograms({
    page,
    pageSize,
    search,
    type,
}: UseProgramsOptions) {
    const query = useMemo(() => {
        return {
            programs: {
                resource: 'programs',
                params: ({ page, pageSize, search, type }) => {
                    const filters = buildProgramFilters(search, type)
                    return {
                        fields: 'id,displayName,code,shortName,programType,lastUpdated,programStages[id],programRules[id]',
                        order: 'displayName:asc',
                        page,
                        pageSize,
                        ...(filters.length > 0 ? { filter: filters } : {}),
                    }
                },
            },
        }
    }, [page, pageSize, search, type])

    const dataQuery = useDataQuery<ProgramsQueryResult>(query, {
        variables: {
            page,
            pageSize,
            search,
            type,
        },
        lazy: true,
    })

    useEffect(() => {
        dataQuery.refetch({
            page,
            pageSize,
            search,
            type,
        })
    }, [page, pageSize, search, type])

    return dataQuery
}
