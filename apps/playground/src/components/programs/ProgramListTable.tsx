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
    IconChevronRight16,
    Pagination,
    Tag,
} from '@dhis2/ui'
import { PAGE_SIZE_OPTIONS } from '@/hooks/buildProgramListUrl'
import { formatLastUpdated } from '@/utils/formatLastUpdated'
import { PROGRAM_TYPE } from '@/types/program'
import type { Pager, Program } from '@/types/program'

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

function ProgramTypeTag({ program }: { program: Program }) {
    const isTracker = program.programType === PROGRAM_TYPE.WITH_REGISTRATION
    return (
        <Tag
            className={
                isTracker
                    ? 'bg-dhis2-teal-100 text-dhis2-teal-900'
                    : 'bg-dhis2-blue-100 text-dhis2-blue-900'
            }
        >
            {isTracker ? i18n.t('Tracker') : i18n.t('Event')}
        </Tag>
    )
}

function ProgramRow({
    program,
    onProgramSelect,
}: {
    program: Program
    onProgramSelect: (program: Program) => void
}) {
    const handleSelect = () => onProgramSelect(program)
    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleSelect()
        }
    }

    return (
        <DataTableRow className="cursor-pointer hover:bg-dhis2-grey-100">
            <DataTableCell
                onClick={handleSelect}
                role="button"
                tabIndex={0}
                onKeyDown={handleKeyDown}
            >
                <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-medium leading-5 text-dhis2-grey-900">
                        {program.displayName}
                    </span>
                    <span className="font-mono text-[11px] text-dhis2-grey-600">
                        {program.id}
                    </span>
                </div>
            </DataTableCell>
            <DataTableCell onClick={handleSelect} className="w-[120px]">
                <ProgramTypeTag program={program} />
            </DataTableCell>
            <DataTableCell
                onClick={handleSelect}
                align="right"
                className="w-[88px] tabular-nums"
            >
                {program.stageCount}
            </DataTableCell>
            <DataTableCell
                onClick={handleSelect}
                align="right"
                className="w-[128px]"
            >
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                    <span
                        className={`size-1.5 rounded-full ${
                            program.ruleCount > 0
                                ? 'bg-dhis2-teal-600'
                                : 'bg-dhis2-grey-400'
                        }`}
                        aria-hidden="true"
                    />
                    {program.ruleCount === 0
                        ? i18n.t('None')
                        : program.ruleCount}
                </span>
            </DataTableCell>
            <DataTableCell
                onClick={handleSelect}
                className="w-[140px] text-dhis2-grey-600 text-[13px]"
            >
                {formatLastUpdated(program.lastUpdated)}
            </DataTableCell>
            <DataTableCell
                onClick={handleSelect}
                className="w-11 text-dhis2-grey-600"
            >
                <div className="flex justify-center">
                    <IconChevronRight16 />
                </div>
            </DataTableCell>
        </DataTableRow>
    )
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
                            {i18n.t('Program')}
                        </DataTableColumnHeader>
                        <DataTableColumnHeader className="w-[120px]">
                            {i18n.t('Type')}
                        </DataTableColumnHeader>
                        <DataTableColumnHeader
                            align="right"
                            className="w-[88px]"
                        >
                            {i18n.t('Stages')}
                        </DataTableColumnHeader>
                        <DataTableColumnHeader
                            align="right"
                            className="w-[128px]"
                        >
                            {i18n.t('Rules')}
                        </DataTableColumnHeader>
                        <DataTableColumnHeader className="w-[140px]">
                            {i18n.t('Last updated')}
                        </DataTableColumnHeader>
                        <DataTableColumnHeader className="w-11" />
                    </DataTableRow>
                </DataTableHead>
                <DataTableBody>
                    {loading ? (
                        <DataTableRow>
                            <DataTableCell colSpan="6">
                                <Center>
                                    <CircularLoader />
                                </Center>
                            </DataTableCell>
                        </DataTableRow>
                    ) : programs.length > 0 ? (
                        programs.map((program) => (
                            <ProgramRow
                                key={program.id}
                                program={program}
                                onProgramSelect={onProgramSelect}
                            />
                        ))
                    ) : (
                        <DataTableRow>
                            <DataTableCell colSpan="6">
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
                            <DataTableCell colSpan="6">
                                <div className="p-4">
                                    <Pagination
                                        page={page}
                                        pageSize={pageSize}
                                        pageSizes={[...PAGE_SIZE_OPTIONS]}
                                        pageCount={pageCount}
                                        pageLength={programs.length}
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
