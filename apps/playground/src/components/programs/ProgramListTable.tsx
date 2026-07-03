import React from 'react'
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
        <div className="overflow-x-auto mt-dp4">
            <DataTable>
                <DataTableHead>
                    <DataTableRow>
                        <DataTableColumnHeader>
                            {i18n.t('Name')}
                        </DataTableColumnHeader>
                        <DataTableColumnHeader>
                            {i18n.t('Type')}
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
                            return (
                                <DataTableRow key={program.id}>
                                    <DataTableCell
                                        onClick={() => onProgramSelect(program)}
                                    >
                                        {program.displayName}
                                    </DataTableCell>
                                    <DataTableCell>
                                        {formatProgramType(program.programType)}
                                    </DataTableCell>
                                </DataTableRow>
                            )
                        })
                    ) : (
                        <DataTableRow>
                            <DataTableCell colSpan="2">
                                <div className="py-dp32 px-dp24 text-center text-dhis2-grey-700">
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
                            <DataTableCell colSpan="2">
                                <div className="p-4">
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
