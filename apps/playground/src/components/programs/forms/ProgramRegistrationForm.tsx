import { useDataEngine } from '@dhis2/app-runtime'
import { FormFeedback } from '@dhis2-form-utils/dhis2-ui'
import {
    FormStateProvider,
    type TrackerProgramMetadata,
    useTrackerForm,
} from '@dhis2-form-utils/hooks'
import { filterPayload } from '@dhis2-form-utils/rules'
import i18n from '@dhis2/d2-i18n'
import { useMemo, useState } from 'react'
import { FormProvider, type UseFormReturn } from 'react-hook-form'
import type { OrgUnit } from '@/types/program'
import { formatDhis2Error } from '@/utils/formatDhis2Error'
import {
    buildTrackerRegistrationPayload,
    type TrackerRegistrationValues,
} from '@/utils/trackerPayloads'
import { ProgramFormActions } from './ProgramFormActions'
import { RegistrationFormFields } from './RegistrationFormFields'
import { TrackerSystemFields } from './TrackerSystemFields'

type ProgramRegistrationFormProps = {
    programId: string
    metadata: TrackerProgramMetadata
    orgUnits: OrgUnit[]
}

function createTodayValue() {
    return new Date().toISOString().slice(0, 10)
}

export function ProgramRegistrationForm({
    programId,
    metadata,
    orgUnits,
}: ProgramRegistrationFormProps) {
    const dataEngine = useDataEngine()
    const stableMetadata = useMemo(() => metadata, [metadata])
    const defaultValues = useMemo(
        () => ({
            orgUnit: '',
            enrolledAt: createTodayValue(),
            ...(metadata.displayIncidentDate
                ? { occurredAt: createTodayValue() }
                : {}),
        }),
        [metadata.displayIncidentDate]
    )
    const { form, formStore } = useTrackerForm<TrackerRegistrationValues>({
        options: {
            programId,
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
            ) as TrackerRegistrationValues
            const payload = buildTrackerRegistrationPayload({
                values: filteredValues,
                metadata,
                programId,
            })

            await dataEngine.mutate({
                resource: 'tracker',
                type: 'create',
                data: payload,
            })

            form.reset(values)
            setSuccessMessage(i18n.t('Tracked entity registered successfully'))
        } catch (error) {
            form.setError('root', {
                message: formatDhis2Error(error),
            })
        }
    })

    return (
        <FormStateProvider
            formStore={formStore}
            form={form as unknown as UseFormReturn<Record<string, unknown>>}
        >
            <FormProvider {...form}>
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-dp16"
                >
                    <TrackerSystemFields
                        metadata={metadata}
                        orgUnits={orgUnits}
                    />
                    <FormFeedback />
                    <RegistrationFormFields metadata={metadata} />
                    <ProgramFormActions
                        submitLabel={i18n.t('Register tracked entity')}
                        errorTitle={i18n.t('Could not save registration')}
                        successMessage={successMessage}
                        successTitle={i18n.t('Registration saved')}
                    />
                </form>
            </FormProvider>
        </FormStateProvider>
    )
}
