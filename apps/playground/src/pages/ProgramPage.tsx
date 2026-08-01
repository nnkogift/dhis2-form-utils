import React, { useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import i18n from '@dhis2/d2-i18n'
import { Center, CircularLoader, NoticeBox } from '@dhis2/ui'
import { useEventProgramMetadataQuery } from '@dhis2-form-utils/hooks'
import { ProgramContextBar } from '@/components/programs/ProgramContextBar'
import { ProgramStageFormScreen } from '@/components/programs/forms/ProgramStageFormScreen'
import { TrackerProgramShell } from '@/components/programs/forms/TrackerProgramShell'
import { buildProgramListUrl } from '@/hooks/buildProgramListUrl'
import { useAccessibleOrgUnits } from '@/hooks/useAccessibleOrgUnits'
import { PROGRAM_TYPE, type ProgramListParams } from '@/types/program'

type ProgramPageLocationState = {
    listParams?: ProgramListParams
}

function createTodayValue() {
    return new Date().toISOString().slice(0, 10)
}

export function ProgramPage() {
    const { programId } = useParams<{ programId: string }>()
    const location = useLocation()
    const listParams = (location.state as ProgramPageLocationState | null)
        ?.listParams
    const backUrl = listParams ? buildProgramListUrl(listParams) : '/'
    const {
        metadata: program,
        error,
        loading,
    } = useEventProgramMetadataQuery(programId)
    const {
        orgUnits,
        loading: orgUnitsLoading,
        error: orgUnitsError,
    } = useAccessibleOrgUnits()

    const [orgUnitId, setOrgUnitId] = useState('')
    const [primaryDate, setPrimaryDate] = useState(createTodayValue)

    const isTracker = program?.programType === PROGRAM_TYPE.WITH_REGISTRATION
    const programMeta = useMemo(() => {
        if (!program) {
            return ''
        }
        const typeLabel = isTracker
            ? i18n.t('Tracker')
            : i18n.t('Event program')
        return i18n.t('{{typeLabel}} · {{count}} rules', {
            typeLabel,
            count: program.programRules.length,
        })
    }, [program, isTracker])

    const handleResetPlayground = () => {
        setOrgUnitId('')
        setPrimaryDate(createTodayValue())
    }

    if (loading || orgUnitsLoading) {
        return (
            <Center>
                <CircularLoader />
            </Center>
        )
    }

    if (error || !program) {
        return (
            <div className="flex flex-col gap-dp16 pb-dp24">
                <Link
                    className="text-dhis2-teal-700 no-underline font-medium hover:underline"
                    to={backUrl}
                >
                    {i18n.t('Back to programs')}
                </Link>
                <NoticeBox error title={i18n.t('Error')}>
                    {i18n.t('Program not found')}
                </NoticeBox>
            </div>
        )
    }

    return (
        <div className="flex h-full flex-col">
            <ProgramContextBar
                backUrl={backUrl}
                programName={program.displayName}
                programMeta={programMeta}
                orgUnits={orgUnits}
                orgUnitId={orgUnitId}
                onOrgUnitChange={setOrgUnitId}
                primaryDateLabel={
                    isTracker ? i18n.t('Enrollment date') : i18n.t('Event date')
                }
                primaryDateValue={primaryDate}
                onPrimaryDateChange={setPrimaryDate}
                onResetPlayground={handleResetPlayground}
            />
            <div className="flex min-h-0 flex-1 flex-col">
                {orgUnitsError ? (
                    <div className="p-dp16">
                        <NoticeBox
                            error
                            title={i18n.t('Could not load organisation units')}
                        >
                            {i18n.t(
                                'The current user organisation units could not be loaded for data entry.'
                            )}
                        </NoticeBox>
                    </div>
                ) : null}
                {!orgUnitsError && orgUnits.length === 0 ? (
                    <div className="p-dp16">
                        <NoticeBox
                            title={i18n.t('No organisation units available')}
                        >
                            {i18n.t(
                                'The current user does not have any accessible organisation units for this playground.'
                            )}
                        </NoticeBox>
                    </div>
                ) : null}
                {!orgUnitsError && orgUnits.length > 0 ? (
                    <div className="flex min-h-0 flex-1 flex-col">
                        {isTracker ? (
                            <TrackerProgramShell
                                program={program}
                                programId={program.id}
                                orgUnitId={orgUnitId}
                                enrolledAt={primaryDate}
                            />
                        ) : (
                            <ProgramStageFormScreen
                                program={program}
                                programStageId={program.programStages?.[0]?.id}
                                orgUnitId={orgUnitId}
                                occurredAt={primaryDate}
                            />
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    )
}
