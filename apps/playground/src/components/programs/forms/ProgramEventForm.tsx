import { useDataEngine } from '@dhis2/app-runtime'
import { FormFeedback } from '@dhis2-form-utils/dhis2-ui'
import { FormStateProvider, useEventForm } from '@dhis2-form-utils/hooks'
import type { ProgramStageMetadata } from '@dhis2-form-utils/metadata'
import { filterPayload } from '@dhis2-form-utils/rules'
import i18n from '@dhis2/d2-i18n'
import { useMemo, useState } from 'react'
import type { OrgUnit, ProgramHeader } from '@/types/program'
import { formatDhis2Error } from '@/utils/formatDhis2Error'
import {
    buildEventPayload,
    type EventFormValues,
} from '@/utils/trackerPayloads'
import { EventFormFields } from './EventFormFields'
import { EventSystemFields } from './EventSystemFields'
import { ProgramFormActions } from './ProgramFormActions'

type ProgramEventFormProps = {
    program: ProgramHeader
    metadata: ProgramStageMetadata
    programStageId: string
    orgUnits: OrgUnit[]
}

function createTodayValue() {
    return new Date().toISOString().slice(0, 10)
}

export function ProgramEventForm({
    program,
    metadata,
    programStageId,
    orgUnits,
}: ProgramEventFormProps) {
    const dataEngine = useDataEngine()
    const stableMetadata = useMemo(() => metadata, [metadata])
    const defaultValues = useMemo<EventFormValues>(
        () => ({
            orgUnit: '',
            occurredAt: createTodayValue(),
        }),
        []
    )
    const { form, formStore } = useEventForm<EventFormValues>({
        options: {
            programStageId,
            metadata: stableMetadata,
        },
        formOptions: {
            mode: 'onBlur',
            defaultValues,
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
            <form onSubmit={handleSubmit} className="flex flex-col gap-dp16">
                <EventSystemFields orgUnits={orgUnits} />
                <FormFeedback />
                <EventFormFields metadata={metadata} />
                <ProgramFormActions
                    submitLabel={i18n.t('Save event')}
                    errorTitle={i18n.t('Could not save event')}
                    successMessage={successMessage}
                    successTitle={i18n.t('Event saved')}
                />
            </form>
        </FormStateProvider>
    )
}
