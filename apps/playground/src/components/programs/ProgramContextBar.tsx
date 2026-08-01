import React from 'react'
import { Link } from 'react-router'
import i18n from '@dhis2/d2-i18n'
import {
    Button,
    IconArrowLeft16,
    IconSync16,
    InputField,
    SingleSelectField,
    SingleSelectOption,
} from '@dhis2/ui'
import type { OrgUnit } from '@/types/program'

type ProgramContextBarProps = {
    backUrl: string
    programName: string
    programMeta: string
    orgUnits: OrgUnit[]
    orgUnitId: string
    onOrgUnitChange: (orgUnitId: string) => void
    primaryDateLabel: string
    primaryDateValue: string
    onPrimaryDateChange: (value: string) => void
    onResetPlayground: () => void
}

export function ProgramContextBar({
    backUrl,
    programName,
    programMeta,
    orgUnits,
    orgUnitId,
    onOrgUnitChange,
    primaryDateLabel,
    primaryDateValue,
    onPrimaryDateChange,
    onResetPlayground,
}: ProgramContextBarProps) {
    return (
        <div className="flex shrink-0 items-center gap-5 border-b border-dhis2-grey-400 bg-white px-5 py-2.5">
            <Link
                to={backUrl}
                className="flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-dhis2-teal-700 no-underline hover:underline"
            >
                <IconArrowLeft16 />
                {i18n.t('Programs')}
            </Link>
            <div className="h-7 w-px shrink-0 bg-dhis2-grey-300" />
            <div className="flex min-w-0 flex-col gap-px">
                <span className="truncate text-[15px] font-bold leading-tight text-dhis2-grey-900">
                    {programName}
                </span>
                <span className="text-xs text-dhis2-grey-600">
                    {programMeta}
                </span>
            </div>
            <div className="ml-auto flex shrink-0 items-end gap-dp12">
                <div className="w-[196px]">
                    <SingleSelectField
                        dense
                        label={i18n.t('Organisation unit')}
                        selected={orgUnitId}
                        onChange={({ selected }) => {
                            onOrgUnitChange(selected ?? '')
                        }}
                    >
                        {orgUnits.map((orgUnit) => (
                            <SingleSelectOption
                                key={orgUnit.id}
                                label={orgUnit.displayName}
                                value={orgUnit.id}
                            />
                        ))}
                    </SingleSelectField>
                </div>
                <div className="w-[130px]">
                    <InputField
                        dense
                        type="date"
                        label={primaryDateLabel}
                        value={primaryDateValue}
                        onChange={({ value }) => {
                            onPrimaryDateChange(value ?? '')
                        }}
                    />
                </div>
                <Button small icon={<IconSync16 />} onClick={onResetPlayground}>
                    {i18n.t('Reset playground')}
                </Button>
            </div>
        </div>
    )
}
