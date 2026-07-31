import { useDataEngine } from '@dhis2/app-runtime'
import { FormFeedback } from '@dhis2-form-utils/dhis2-ui'
import {
    ProgramRulesPanel,
    RuleDevtoolsPanel,
    RuleDevtoolsScope,
} from '@dhis2-form-utils/devtools'
import {
    FormStateProvider,
    type TrackerProgramMetadata,
    useTrackerForm,
} from '@dhis2-form-utils/hooks'
import { filterPayload } from '@dhis2-form-utils/rules'
import i18n from '@dhis2/d2-i18n'
import React, { useMemo, useState } from 'react'
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
import { Link } from 'react-router'

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
            metadata,
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
            <RuleDevtoolsScope formStore={formStore}>
                <div className="flex h-full w-full flex-1 gap-dp16 min-h-0">
                    <ProgramRulesPanel
                        metadata={{ formKind: 'tracker', metadata }}
                    />
                    <FormProvider {...form}>
                        <form
                            onSubmit={handleSubmit}
                            className="flex min-w-0 flex-1 flex-col gap-dp16 py-4"
                        >
                            <Link
                                className="text-dhis2-teal-700 no-underline font-medium hover:underline"
                                to="/"
                            >
                                {i18n.t('Back to programs')}
                            </Link>
                            <h2 className="text-2xl font-bold">
                                {metadata.displayName}
                            </h2>
                            <TrackerSystemFields
                                metadata={metadata}
                                orgUnits={orgUnits}
                            />
                            <FormFeedback />
                            <RegistrationFormFields metadata={metadata} />
                            <ProgramFormActions
                                submitLabel={i18n.t('Register tracked entity')}
                                errorTitle={i18n.t(
                                    'Could not save registration'
                                )}
                                successMessage={successMessage}
                                successTitle={i18n.t('Registration saved')}
                            />
                        </form>
                    </FormProvider>
                    <RuleDevtoolsPanel
                        metadata={{ formKind: 'tracker', metadata }}
                    />
                </div>
            </RuleDevtoolsScope>
        </FormStateProvider>
    )
}
