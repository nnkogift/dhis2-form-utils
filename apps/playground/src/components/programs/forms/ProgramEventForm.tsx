import { useDataEngine } from '@dhis2/app-runtime'
import {
    createLabelLookup,
    RuleDevtoolsScope,
    RulesPanel,
} from '@dhis2-form-utils/devtools'
import { FormStateProvider, useEventForm } from '@dhis2-form-utils/hooks'
import type {
    EventProgramMetadata,
    ProgramStageMetadata,
} from '@dhis2-form-utils/metadata'
import { filterPayload } from '@dhis2-form-utils/rules'
import i18n from '@dhis2/d2-i18n'
import React, { useEffect, useMemo, useState } from 'react'
import { GhostToggleButton } from '@/components/rules/GhostToggleButton'
import { RuleDisplayProvider } from '@/components/rules/RuleDisplayContext'
import { RuleFeedbackList } from '@/components/rules/RuleFeedbackList'
import { formatDhis2Error } from '@/utils/formatDhis2Error'
import {
    buildEventPayload,
    type EventFormValues,
} from '@/utils/trackerPayloads'
import { EventFormFields } from './EventFormFields'
import { ProgramFormActions } from './ProgramFormActions'

type ProgramEventFormProps = {
    program: EventProgramMetadata
    stageMetadata: ProgramStageMetadata
    programStageId: string
    orgUnitId: string
    occurredAt: string
}

export function ProgramEventForm({
    program,
    stageMetadata,
    programStageId,
    orgUnitId,
    occurredAt,
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
                orgUnit: orgUnitId,
                occurredAt,
            },
        },
    })
    const [successMessage, setSuccessMessage] = useState<string>()
    const [ghostsEnabled, setGhostsEnabled] = useState(true)
    const labelLookup = useMemo(
        () =>
            createLabelLookup({
                formKind: 'event',
                metadata: program,
                programStageId,
            }),
        [program, programStageId]
    )

    useEffect(() => {
        form.setValue('orgUnit', orgUnitId, { shouldValidate: false })
    }, [form, orgUnitId])

    useEffect(() => {
        form.setValue('occurredAt', occurredAt, { shouldValidate: false })
    }, [form, occurredAt])

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
                <div className="flex h-full w-full flex-1 min-h-0">
                    <form
                        onSubmit={handleSubmit}
                        className="flex min-w-0 flex-1 flex-col gap-dp16 overflow-auto pt-4 px-7 pb-7"
                    >
                        <GhostToggleButton
                            enabled={ghostsEnabled}
                            onToggle={() => {
                                setGhostsEnabled((current) => !current)
                            }}
                        />
                        <RuleDisplayProvider
                            ghostsEnabled={ghostsEnabled}
                            labelLookup={labelLookup}
                        >
                            <RuleFeedbackList
                                metadata={{
                                    formKind: 'event',
                                    metadata: program,
                                    programStageId,
                                }}
                            />
                            <EventFormFields metadata={stageMetadata} />
                        </RuleDisplayProvider>
                        <ProgramFormActions
                            submitLabel={i18n.t('Save event')}
                            errorTitle={i18n.t('Could not save event')}
                            successMessage={successMessage}
                            successTitle={i18n.t('Event saved')}
                        />
                    </form>
                    <RulesPanel
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
