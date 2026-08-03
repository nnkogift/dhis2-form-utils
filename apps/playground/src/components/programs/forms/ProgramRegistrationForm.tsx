import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    createLabelLookup,
    RuleDevtoolsScope,
    RulesPanel,
    type ProgramStageRef,
} from '@dhis2-form-utils/devtools'
import {
    FormStateProvider,
    type TrackerProgramMetadata,
    useTrackerForm,
} from '@dhis2-form-utils/hooks'
import type { OptionGroupCodeMap } from '@dhis2-form-utils/metadata'
import {
    filterPayload,
    type RuleEventInput,
    type RuleSupplementaryDataInput,
} from '@dhis2-form-utils/rules'
import React, { useEffect, useMemo, useState } from 'react'
import { FormProvider, type UseFormReturn } from 'react-hook-form'
import { GhostToggleButton } from '@/components/rules/GhostToggleButton'
import { RuleDisplayProvider } from '@/components/rules/RuleDisplayContext'
import { RuleFeedbackList } from '@/components/rules/RuleFeedbackList'
import { usePublishFormValues } from '@/hooks/usePublishFormValues'
import { formatDhis2Error } from '@/utils/formatDhis2Error'
import {
    buildTrackerRegistrationPayload,
    type TrackerRegistrationValues,
} from '@/utils/trackerPayloads'
import { FormDateField } from './FormDateField'
import { ProgramFormActions } from './ProgramFormActions'
import { RegistrationFormFields } from './RegistrationFormFields'

type ProgramRegistrationFormProps = {
    programId: string
    metadata: TrackerProgramMetadata
    programStages: ProgramStageRef[]
    orgUnitId: string
    enrolledAt: string
    events?: RuleEventInput[]
    supplementaryData?: RuleSupplementaryDataInput
    optionGroups?: OptionGroupCodeMap
    onValuesChange?: (values: Record<string, unknown>) => void
}

function createTodayValue() {
    return new Date().toISOString().slice(0, 10)
}

export function ProgramRegistrationForm({
    programId,
    metadata,
    programStages,
    orgUnitId,
    enrolledAt,
    events,
    supplementaryData,
    optionGroups,
    onValuesChange,
}: ProgramRegistrationFormProps) {
    const dataEngine = useDataEngine()
    const defaultValues = useMemo(
        () => ({
            orgUnit: orgUnitId,
            enrolledAt,
            ...(metadata.displayIncidentDate
                ? { occurredAt: createTodayValue() }
                : {}),
        }),
        // intentionally computed once, at mount, as RHF's initial snapshot only —
        // live updates flow through the setValue effects below, not through this memo
        []
    )
    const { form, formStore } = useTrackerForm<TrackerRegistrationValues>({
        options: {
            programId,
            metadata,
            events,
            supplementaryData,
            optionGroups,
        },
        formOptions: {
            mode: 'onBlur',
            defaultValues,
        },
    })
    usePublishFormValues(form, onValuesChange)
    const [successMessage, setSuccessMessage] = useState<string>()
    const [ghostsEnabled, setGhostsEnabled] = useState(true)
    const rulesMetadata = useMemo(
        () => ({ formKind: 'tracker' as const, metadata, programStages }),
        [metadata, programStages]
    )
    const labelLookup = useMemo(
        () => createLabelLookup(rulesMetadata),
        [rulesMetadata]
    )

    useEffect(() => {
        form.setValue('orgUnit', orgUnitId, { shouldValidate: false })
    }, [form, orgUnitId])

    useEffect(() => {
        form.setValue('enrolledAt', enrolledAt, { shouldValidate: false })
    }, [form, enrolledAt])

    const handleSubmit = form.handleSubmit(async (values) => {
        form.clearErrors('root')
        setSuccessMessage(undefined)

        try {
            const filteredValues = filterPayload(
                values,
                formStore.fieldStore.getSnapshot(),
                formStore.optionGroups
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
                <div className="flex h-full w-full flex-1 min-h-0">
                    <FormProvider {...form}>
                        <form
                            onSubmit={handleSubmit}
                            className="flex min-w-0 flex-1 flex-col gap-dp16 overflow-auto pt-4 px-7 pb-7"
                        >
                            {metadata.displayIncidentDate ? (
                                <FormDateField
                                    name="occurredAt"
                                    label={
                                        metadata.displayIncidentDateLabel ??
                                        i18n.t('Incident date')
                                    }
                                    disabled={form.formState.isSubmitting}
                                />
                            ) : null}
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
                                <RuleFeedbackList metadata={rulesMetadata} />
                                <RegistrationFormFields metadata={metadata} />
                            </RuleDisplayProvider>
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
                    <RulesPanel metadata={rulesMetadata} />
                </div>
            </RuleDevtoolsScope>
        </FormStateProvider>
    )
}
