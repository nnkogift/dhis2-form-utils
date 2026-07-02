import React from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Button, Center, CircularLoader, NoticeBox, Tag } from '@dhis2/ui'
import { buildProgramListUrl } from '@/hooks/buildProgramListUrl'
import {
    PROGRAM_TYPE,
    type Program,
    type ProgramListParams,
} from '@/types/program'
import { formatProgramType } from '@/utils/formatProgramType'
import classes from './ProgramPlaceholderPage.module.css'

type ProgramQueryResult = {
    program: Program
}

type PlaceholderLocationState = {
    listParams?: ProgramListParams
}

export function ProgramPlaceholderPage() {
    const { programId } = useParams<{ programId: string }>()
    const location = useLocation()
    const listParams = (location.state as PlaceholderLocationState | null)
        ?.listParams
    const backUrl = listParams ? buildProgramListUrl(listParams) : '/'

    const query = {
        program: {
            resource: 'programs',
            id: programId,
            params: {
                fields: 'id,displayName,code,programType',
            },
        },
    }

    const { data, error, loading } = useDataQuery<ProgramQueryResult>(query)
    const program = data?.program

    if (loading) {
        return (
            <Center>
                <CircularLoader />
            </Center>
        )
    }

    if (error || !program) {
        return (
            <div className={classes.page}>
                <Link className={classes.backLink} to={backUrl}>
                    {i18n.t('Back to programs')}
                </Link>
                <NoticeBox error title={i18n.t('Error')}>
                    {i18n.t('Program not found')}
                </NoticeBox>
            </div>
        )
    }

    const isRegistration =
        program.programType === PROGRAM_TYPE.WITH_REGISTRATION
    const placeholderTitle = isRegistration
        ? i18n.t('Registration data entry form')
        : i18n.t('Event data entry form')
    const placeholderMessage = isRegistration
        ? i18n.t('Registration data entry form — coming soon')
        : i18n.t('Event data entry form — coming soon')

    return (
        <div className={classes.page}>
            <Link className={classes.backLink} to={backUrl}>
                {i18n.t('Back to programs')}
            </Link>
            <h2>{program.displayName}</h2>
            <div className={classes.meta}>
                <span className={classes.code}>{program.code}</span>
                <Tag>{formatProgramType(program.programType)}</Tag>
            </div>
            <NoticeBox title={placeholderTitle}>{placeholderMessage}</NoticeBox>
            <Button secondary small disabled>
                {i18n.t('Open form')}
            </Button>
            {/*
              Future integration:
              - WITH_REGISTRATION → useTrackerForm (registration data entry)
              - WITHOUT_REGISTRATION → useEventForm + first programStage
            */}
        </div>
    )
}
