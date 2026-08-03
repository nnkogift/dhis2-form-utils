import React, { useCallback, useEffect, useState } from 'react'
import i18n from '@dhis2/d2-i18n'
import { IconSearch16, InputField, SegmentedControl } from '@dhis2/ui'
import { useDebounceCallback } from 'usehooks-ts'
import type { ProgramTypeFilter } from '@/types/program'

const SEARCH_DEBOUNCE_MS = 300

const TYPE_SEGMENTS: Array<{ label: string; value: ProgramTypeFilter }> = [
    { label: i18n.t('All'), value: 'all' },
    { label: i18n.t('Tracker'), value: 'registration' },
    { label: i18n.t('Event'), value: 'event' },
]

type ProgramListFiltersProps = {
    search: string
    type: ProgramTypeFilter
    onSearchChange: (search: string) => void
    onTypeChange: (type: ProgramTypeFilter) => void
}

export function ProgramListFilters({
    search,
    type,
    onSearchChange,
    onTypeChange,
}: ProgramListFiltersProps) {
    const [localSearch, setLocalSearch] = useState(search)

    const debouncedOnSearchChange = useDebounceCallback(
        useCallback(
            (value: string) => {
                onSearchChange(value)
            },
            [onSearchChange]
        ),
        SEARCH_DEBOUNCE_MS
    )

    useEffect(() => {
        setLocalSearch(search)
        debouncedOnSearchChange.cancel()
    }, [search, debouncedOnSearchChange])

    return (
        <div className="flex items-center gap-dp12 justify-between flex-wrap">
            <div className="w-75">
                <InputField
                    type="search"
                    dense
                    clearable
                    // @dhis2/ui types `prefixIcon` as DOM `Element`, but it renders a ReactNode at runtime
                    prefixIcon={(<IconSearch16 />) as unknown as Element}
                    placeholder={i18n.t('Search by name, code, or ID')}
                    value={localSearch}
                    onChange={({ value }) => {
                        const next = value ?? ''
                        setLocalSearch(next)
                        debouncedOnSearchChange(next)
                    }}
                />
            </div>
            <SegmentedControl
                options={TYPE_SEGMENTS}
                selected={type}
                onChange={({ value }) => {
                    onTypeChange(value as ProgramTypeFilter)
                }}
            />
        </div>
    )
}
