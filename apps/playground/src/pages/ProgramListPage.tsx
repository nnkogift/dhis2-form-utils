import React from 'react'
import { useNavigate } from 'react-router'
import i18n from '@dhis2/d2-i18n'
import { NoticeBox } from '@dhis2/ui'
import { ProgramListFilters } from '@/components/programs/ProgramListFilters'
import { ProgramListTable } from '@/components/programs/ProgramListTable'
import { useProgramListParams } from '@/hooks/useProgramListParams'
import { usePrograms } from '@/hooks/usePrograms'
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

    const programs = data?.programs?.programs ?? []
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
        <div className="flex flex-col gap-dp24 pb-dp32 md:gap-dp32">
            <header>
                <h2 className="m-0">{i18n.t('Programs')}</h2>
            </header>
            <section
                className="flex flex-col gap-dp8"
                aria-label={i18n.t('Program filters')}
            >
                <ProgramListFilters
                    search={search}
                    type={type}
                    onSearchChange={setSearch}
                    onTypeChange={setType}
                />
            </section>
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
