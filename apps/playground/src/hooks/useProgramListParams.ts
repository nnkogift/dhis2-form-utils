import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import {
    buildProgramListUrl,
    DEFAULT_PAGE_SIZE,
    parsePageSize,
    parseProgramTypeFilter,
} from '@/hooks/buildProgramListUrl'
import type { ProgramListParams, ProgramTypeFilter } from '@/types/program'

export function useProgramListParams() {
    const [searchParams, setSearchParams] = useSearchParams()

    const params = useMemo<ProgramListParams>(() => {
        const page = Math.max(1, Number(searchParams.get('page')) || 1)
        const pageSize = parsePageSize(searchParams.get('pageSize'))

        return {
            search: searchParams.get('search') ?? '',
            type: parseProgramTypeFilter(searchParams.get('type')),
            page,
            pageSize,
        }
    }, [searchParams])

    const updateParams = useCallback(
        (updates: Partial<ProgramListParams>, resetPage = false) => {
            setSearchParams(
                (previous) => {
                    const next = new URLSearchParams(previous)
                    const merged: ProgramListParams = {
                        ...params,
                        ...updates,
                    }

                    if (resetPage) {
                        merged.page = 1
                    }

                    if (merged.search) {
                        next.set('search', merged.search)
                    } else {
                        next.delete('search')
                    }

                    if (merged.type !== 'all') {
                        next.set('type', merged.type)
                    } else {
                        next.delete('type')
                    }

                    if (merged.page > 1) {
                        next.set('page', String(merged.page))
                    } else {
                        next.delete('page')
                    }

                    if (merged.pageSize !== DEFAULT_PAGE_SIZE) {
                        next.set('pageSize', String(merged.pageSize))
                    } else {
                        next.delete('pageSize')
                    }

                    return next
                },
                { replace: true }
            )
        },
        [params, setSearchParams]
    )

    const setSearch = useCallback(
        (search: string) => {
            updateParams({ search }, true)
        },
        [updateParams]
    )

    const setType = useCallback(
        (type: ProgramTypeFilter) => {
            updateParams({ type }, true)
        },
        [updateParams]
    )

    const setPage = useCallback(
        (page: number) => {
            updateParams({ page: Math.max(1, page) })
        },
        [updateParams]
    )

    const setPageSize = useCallback(
        (pageSize: number) => {
            updateParams({ pageSize, page: 1 })
        },
        [updateParams]
    )

    const listUrl = useMemo(() => buildProgramListUrl(params), [params])

    return {
        ...params,
        listUrl,
        setSearch,
        setType,
        setPage,
        setPageSize,
    }
}
