import React, { useCallback, useEffect, useState } from 'react'
import i18n from '@dhis2/d2-i18n'
import {
    Button,
    InputField,
    SingleSelectField,
    SingleSelectOption,
} from '@dhis2/ui'
import { useDebounceCallback } from 'usehooks-ts'
import type { ProgramTypeFilter } from '@/types/program'

const SEARCH_DEBOUNCE_MS = 300

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
        <div className="flex flex-wrap gap-dp16 items-end md:gap-dp24">
            <div className="flex-[1_1_280px] min-w-0">
                <InputField
                    label={i18n.t('Search programs')}
                    placeholder={i18n.t('Search by name, code, or ID')}
                    value={localSearch}
                    onChange={({ value }) => {
                        const next = value ?? ''
                        setLocalSearch(next)
                        debouncedOnSearchChange(next)
                    }}
                />
            </div>
            <div className="flex-[0_1_240px] min-w-[200px]">
                <SingleSelectField
                    label={i18n.t('Program type')}
                    selected={type}
                    onChange={({ selected }) => {
                        onTypeChange(selected as ProgramTypeFilter)
                    }}
                >
                    <SingleSelectOption value="all" label={i18n.t('All')} />
                    <SingleSelectOption
                        value="registration"
                        label={i18n.t('Registration')}
                    />
                    <SingleSelectOption value="event" label={i18n.t('Event')} />
                </SingleSelectField>
            </div>
            {localSearch ? (
                <div className="flex-none pb-dp4">
                    <Button
                        small
                        secondary
                        onClick={() => {
                            debouncedOnSearchChange.cancel()
                            setLocalSearch('')
                            onSearchChange('')
                        }}
                    >
                        {i18n.t('Clear search')}
                    </Button>
                </div>
            ) : null}
        </div>
    )
}
