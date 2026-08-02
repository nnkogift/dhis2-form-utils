import React from 'react'
import { useNavigate } from 'react-router'
import i18n from '@dhis2/d2-i18n'
import { NoticeBox } from '@dhis2/ui'
import { ProgramListFilters } from '@/components/programs/ProgramListFilters'
import { ProgramListTable } from '@/components/programs/ProgramListTable'
import { useProgramListParams } from '@/hooks/useProgramListParams'
import { usePrograms } from '@/hooks/usePrograms'
import { resolveProgramListItem } from '@/utils/resolveProgramListItem'
import type { Program, ProgramListParams } from '@/types/program'

export function ProgramListPage() {
    const navigate = useNavigate()
    const {
        search,
        type,
        page,
        pageSize,
        setSearch,
        setType,
        setPage,
        setPageSize,
    } = useProgramListParams()
    const { data, error, loading } = usePrograms({
        page,
        pageSize,
        search,
        type,
    })

    const programs = (data?.programs?.programs ?? []).map(
        resolveProgramListItem
    )
    const pager = data?.programs?.pager

    const handleProgramSelect = (program: Program) => {
        const listParams: ProgramListParams = {
            search,
            type,
            page,
            pageSize,
        }

        navigate(`/programs/${program.id}`, {
            state: { listParams },
        })
    }

    return (
        <div className="flex flex-col max-w-400 w-full mx-auto px-8 pt-7 pb-12 gap-5">
            <div className="flex items-end justify-between gap-6 flex-wrap">
                <div className="flex flex-col gap-1">
                    <h1 className="m-0 text-2xl font-medium leading-[1.3] text-dhis2-grey-900">
                        {i18n.t('Programs')}
                    </h1>
                    <p className="m-0 text-sm text-dhis2-grey-700">
                        {i18n.t(
                            'Pick a program to open its forms and watch its rules evaluate.'
                        )}
                    </p>
                </div>
                <ProgramListFilters
                    search={search}
                    type={type}
                    onSearchChange={setSearch}
                    onTypeChange={setType}
                />
            </div>
            <section className="flex flex-col gap-dp16">
                {error ? (
                    <NoticeBox error title={i18n.t('Error')}>
                        {i18n.t('Error loading programs')}
                    </NoticeBox>
                ) : (
                    <ProgramListTable
                        programs={programs}
                        pager={pager}
                        loading={loading}
                        page={page}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                        onProgramSelect={handleProgramSelect}
                    />
                )}
            </section>
        </div>
    )
}
