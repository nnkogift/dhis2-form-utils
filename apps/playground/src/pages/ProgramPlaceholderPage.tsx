import React from 'react'
import { Link, useLocation, useParams } from 'react-router'
import i18n from '@dhis2/d2-i18n'
import { Center, CircularLoader, NoticeBox, Tag } from '@dhis2/ui'
import { ProgramEventFormScreen } from '@/components/programs/forms/ProgramEventFormScreen'
import { ProgramRegistrationFormScreen } from '@/components/programs/forms/ProgramRegistrationFormScreen'
import { buildProgramListUrl } from '@/hooks/buildProgramListUrl'
import { useAccessibleOrgUnits } from '@/hooks/useAccessibleOrgUnits'
import { useEventProgramMetadata } from '@/hooks/useEventProgramMetadata'
import { PROGRAM_TYPE, type ProgramListParams } from '@/types/program'
import { formatProgramType } from '@/utils/formatProgramType'

type PlaceholderLocationState = {
    listParams?: ProgramListParams
}

export function ProgramPlaceholderPage() {
    const { programId } = useParams<{ programId: string }>()
    const location = useLocation()
    const listParams = (location.state as PlaceholderLocationState | null)
        ?.listParams
    const backUrl = listParams ? buildProgramListUrl(listParams) : '/'
    const { data, error, loading } = useEventProgramMetadata(programId)
    const {
        orgUnits,
        loading: orgUnitsLoading,
        error: orgUnitsError,
    } = useAccessibleOrgUnits()
    const program = data?.program

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
        <div className="flex flex-col gap-dp16 pb-dp24 h-full">
            <Link
                className="text-dhis2-teal-700 no-underline font-medium hover:underline"
                to={backUrl}
            >
                {i18n.t('Back to programs')}
            </Link>
            <h2>{program.displayName}</h2>
            <div className="flex flex-wrap gap-dp8 items-center text-dhis2-grey-700">
                <span className="font-mono">{program.code}</span>
                <Tag>{formatProgramType(program.programType)}</Tag>
            </div>
            {orgUnitsError ? (
                <NoticeBox
                    error
                    title={i18n.t('Could not load organisation units')}
                >
                    {i18n.t(
                        'The current user organisation units could not be loaded for data entry.'
                    )}
                </NoticeBox>
            ) : null}
            {!orgUnitsError && orgUnits.length === 0 ? (
                <NoticeBox title={i18n.t('No organisation units available')}>
                    {i18n.t(
                        'The current user does not have any accessible organisation units for this playground.'
                    )}
                </NoticeBox>
            ) : null}
            {!orgUnitsError && orgUnits.length > 0 ? (
                program.programType === PROGRAM_TYPE.WITH_REGISTRATION ? (
                    <ProgramRegistrationFormScreen
                        programId={program.id}
                        orgUnits={orgUnits}
                    />
                ) : (
                    <ProgramEventFormScreen
                        program={program}
                        orgUnits={orgUnits}
                    />
                )
            ) : null}
        </div>
    )
}
