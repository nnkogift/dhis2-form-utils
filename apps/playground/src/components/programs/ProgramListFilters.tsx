import React, { useEffect, useState } from 'react'
import i18n from '@dhis2/d2-i18n'
import {
    Button,
    InputField,
    SingleSelectField,
    SingleSelectOption,
} from '@dhis2/ui'
import type { ProgramTypeFilter } from '@/types/program'
import classes from './ProgramListFilters.module.css'

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

    useEffect(() => {
        setLocalSearch(search)
    }, [search])

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            if (localSearch !== search) {
                onSearchChange(localSearch)
            }
        }, SEARCH_DEBOUNCE_MS)

        return () => {
            window.clearTimeout(timeoutId)
        }
    }, [localSearch, onSearchChange, search])

    return (
        <div className={classes.filters}>
            <div className={classes.searchField}>
                <InputField
                    label={i18n.t('Search programs')}
                    placeholder={i18n.t('Search by name, code, or ID')}
                    value={localSearch}
                    onChange={({ value }) => {
                        setLocalSearch(value ?? '')
                    }}
                />
            </div>
            <div className={classes.typeField}>
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
                <div className={classes.clearButton}>
                    <Button
                        small
                        secondary
                        onClick={() => {
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
