import React, { KeyboardEvent } from 'react'
import i18n from '@dhis2/d2-i18n'
import {
    Center,
    CircularLoader,
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableColumnHeader,
    DataTableFoot,
    DataTableHead,
    DataTableRow,
    Pagination,
} from '@dhis2/ui'
import { PAGE_SIZE_OPTIONS } from '@/hooks/buildProgramListUrl'
import type { Pager, Program } from '@/types/program'
import { formatProgramType } from '@/utils/formatProgramType'
import classes from './ProgramListTable.module.css'

type ProgramListTableProps = {
    programs: Program[]
    pager?: Pager
    loading: boolean
    page: number
    pageSize: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
    onProgramSelect: (program: Program) => void
}

function handleRowKeyDown(
    event: KeyboardEvent<HTMLTableRowElement>,
    onActivate: () => void
) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onActivate()
    }
}

export function ProgramListTable({
    programs,
    pager,
    loading,
    page,
    pageSize,
    onPageChange,
    onPageSizeChange,
    onProgramSelect,
}: ProgramListTableProps) {
    const pageCount = pager?.pageCount ?? 0
    const total = pager?.total ?? 0
    const isLastPage = pageCount > 0 ? page >= pageCount : true

    return (
        <div className={classes.tableContainer}>
            <DataTable>
                <DataTableHead>
                    <DataTableRow>
                        <DataTableColumnHeader large>
                            {i18n.t('Name')}
                        </DataTableColumnHeader>
                        <DataTableColumnHeader large>
                            {i18n.t('Code')}
                        </DataTableColumnHeader>
                        <DataTableColumnHeader large>
                            {i18n.t('Type')}
                        </DataTableColumnHeader>
                        <DataTableColumnHeader large>
                            {i18n.t('ID')}
                        </DataTableColumnHeader>
                    </DataTableRow>
                </DataTableHead>
                <DataTableBody>
                    {loading ? (
                        <DataTableRow>
                            <DataTableCell colSpan="4">
                                <Center>
                                    <CircularLoader />
                                </Center>
                            </DataTableCell>
                        </DataTableRow>
                    ) : programs.length > 0 ? (
                        programs.map((program) => {
                            const activate = () => {
                                onProgramSelect(program)
                            }

                            return (
                                <DataTableRow
                                    key={program.id}
                                    className={classes.clickableRow}
                                    tabIndex={0}
                                    onClick={activate}
                                    onKeyDown={(event) => {
                                        handleRowKeyDown(event, activate)
                                    }}
                                >
                                    <DataTableCell large>
                                        {program.displayName}
                                    </DataTableCell>
                                    <DataTableCell large>
                                        {program.code}
                                    </DataTableCell>
                                    <DataTableCell large>
                                        {formatProgramType(program.programType)}
                                    </DataTableCell>
                                    <DataTableCell
                                        large
                                        className={classes.idCell}
                                    >
                                        {program.id}
                                    </DataTableCell>
                                </DataTableRow>
                            )
                        })
                    ) : (
                        <DataTableRow>
                            <DataTableCell colSpan="4">
                                <div className={classes.emptyState}>
                                    {i18n.t(
                                        'No programs found. Try adjusting your search or filter.'
                                    )}
                                </div>
                            </DataTableCell>
                        </DataTableRow>
                    )}
                </DataTableBody>
                {!loading && pageCount > 0 ? (
                    <DataTableFoot>
                        <DataTableRow>
                            <DataTableCell colSpan="4">
                                <div className={classes.paginationRow}>
                                    <Pagination
                                        page={page}
                                        pageSize={pageSize}
                                        pageSizes={[...PAGE_SIZE_OPTIONS]}
                                        pageCount={pageCount}
                                        total={total}
                                        isLastPage={isLastPage}
                                        onPageChange={onPageChange}
                                        onPageSizeChange={onPageSizeChange}
                                    />
                                </div>
                            </DataTableCell>
                        </DataTableRow>
                    </DataTableFoot>
                ) : null}
            </DataTable>
        </div>
    )
}
