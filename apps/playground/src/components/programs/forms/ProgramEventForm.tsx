import { useDataEngine } from '@dhis2/app-runtime'
import { FormFeedback } from '@dhis2-form-utils/dhis2-ui'
import {
    ProgramRulesPanel,
    RuleDevtoolsPanel,
    RuleDevtoolsScope,
} from '@dhis2-form-utils/devtools'
import { FormStateProvider, useEventForm } from '@dhis2-form-utils/hooks'
import type {
    EventProgramMetadata,
    ProgramStageMetadata,
} from '@dhis2-form-utils/metadata'
import { filterPayload } from '@dhis2-form-utils/rules'
import i18n from '@dhis2/d2-i18n'
import React, { useState } from 'react'
import type { OrgUnit } from '@/types/program'
import { formatDhis2Error } from '@/utils/formatDhis2Error'
import {
    buildEventPayload,
    type EventFormValues,
} from '@/utils/trackerPayloads'
import { EventFormFields } from './EventFormFields'
import { EventSystemFields } from './EventSystemFields'
import { ProgramFormActions } from './ProgramFormActions'
import { Link } from 'react-router'

type ProgramEventFormProps = {
    program: EventProgramMetadata
    stageMetadata: ProgramStageMetadata
    programStageId: string
    orgUnits: OrgUnit[]
}

function createTodayValue() {
    return new Date().toISOString().slice(0, 10)
}

export function ProgramEventForm({
    program,
    stageMetadata,
    programStageId,
    orgUnits,
}: ProgramEventFormProps) {
    const dataEngine = useDataEngine()

    const { form, formStore } = useEventForm<EventFormValues>({
        options: {
            programStageId,
            metadata: program,
        },
        formOptions: {
            mode: 'onBlur',
            defaultValues: {
                orgUnit: '',
                occurredAt: createTodayValue(),
            },
        },
    })
    const [successMessage, setSuccessMessage] = useState<string>()

    const handleSubmit = form.handleSubmit(async (values) => {
        form.clearErrors('root')
        setSuccessMessage(undefined)

        try {
            const filteredValues = filterPayload(
                values,
                formStore.fieldStore.getSnapshot()
            ) as EventFormValues
            const payload = buildEventPayload({
                values: filteredValues,
                programId: program.id,
                programStageId,
            })

            await dataEngine.mutate({
                resource: 'tracker',
                type: 'create',
                data: payload,
            })

            form.reset(values)
            setSuccessMessage(i18n.t('Event saved successfully'))
        } catch (error) {
            form.setError('root', {
                message: formatDhis2Error(error),
            })
        }
    })

    return (
        <FormStateProvider<EventFormValues> formStore={formStore} form={form}>
            <RuleDevtoolsScope formStore={formStore}>
                <div className="flex h-full w-full flex-1 gap-dp16 min-h-0">
                    <ProgramRulesPanel
                        metadata={{
                            formKind: 'event',
                            metadata: program,
                            programStageId,
                        }}
                    />
                    <form
                        onSubmit={handleSubmit}
                        className="flex min-w-0 flex-1 flex-col gap-dp16"
                    >
                        <Link
                            className="text-dhis2-teal-700 no-underline font-medium hover:underline"
                            to="/"
                        >
                            {i18n.t('Back to programs')}
                        </Link>
                        <h2 className="text-2xl font-bold">
                            {program.displayName}
                        </h2>
                        <EventSystemFields orgUnits={orgUnits} />
                        <FormFeedback />
                        <EventFormFields metadata={stageMetadata} />
                        <ProgramFormActions
                            submitLabel={i18n.t('Save event')}
                            errorTitle={i18n.t('Could not save event')}
                            successMessage={successMessage}
                            successTitle={i18n.t('Event saved')}
                        />
                    </form>
                    <RuleDevtoolsPanel
                        metadata={{
                            formKind: 'event',
                            metadata: program,
                            programStageId,
                        }}
                    />
                </div>
            </RuleDevtoolsScope>
        </FormStateProvider>
    )
}
