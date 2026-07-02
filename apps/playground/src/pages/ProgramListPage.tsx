import React from 'react'
import { useNavigate } from 'react-router'
import i18n from '@dhis2/d2-i18n'
import { NoticeBox } from '@dhis2/ui'
import { ProgramListFilters } from '@/components/programs/ProgramListFilters'
import { ProgramListTable } from '@/components/programs/ProgramListTable'
import { useProgramListParams } from '@/hooks/useProgramListParams'
import { usePrograms } from '@/hooks/usePrograms'
import type { Program, ProgramListParams } from '@/types/program'
import classes from './ProgramListPage.module.css'

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
        <div className={classes.page}>
            <header className={classes.pageHeader}>
                <h2 className={classes.pageTitle}>{i18n.t('Programs')}</h2>
            </header>
            <section
                className={classes.toolbar}
                aria-label={i18n.t('Program filters')}
            >
                <ProgramListFilters
                    search={search}
                    type={type}
                    onSearchChange={setSearch}
                    onTypeChange={setType}
                />
            </section>
            <section className={classes.content}>
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
