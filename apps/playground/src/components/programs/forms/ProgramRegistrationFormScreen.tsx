import i18n from '@dhis2/d2-i18n'
import { Center, CircularLoader, NoticeBox } from '@dhis2/ui'
import type { ProgramStageRef } from '@nnkogift/dhis2-form-utils-devtools'
import type { TrackerProgramMetadata } from '@nnkogift/dhis2-form-utils-hooks'
import type { OptionGroupCodeMap } from '@nnkogift/dhis2-form-utils-metadata'
import type {
    RuleEventInput,
    RuleSupplementaryDataInput,
} from '@nnkogift/dhis2-form-utils-rules'
import { ProgramRegistrationForm } from './ProgramRegistrationForm'

type ProgramRegistrationFormScreenProps = {
    programId: string
    orgUnitId: string
    enrolledAt: string
    metadata: TrackerProgramMetadata | undefined
    programStages: ProgramStageRef[]
    loading: boolean
    error: Error | undefined
    events?: RuleEventInput[]
    supplementaryData?: RuleSupplementaryDataInput
    optionGroups?: OptionGroupCodeMap
    onValuesChange?: (values: Record<string, unknown>) => void
}

export function ProgramRegistrationFormScreen({
    programId,
    orgUnitId,
    enrolledAt,
    metadata,
    programStages,
    loading,
    error,
    events,
    supplementaryData,
    optionGroups,
    onValuesChange,
}: ProgramRegistrationFormScreenProps) {
    if (loading) {
        return (
            <Center>
                <CircularLoader />
            </Center>
        )
    }

    if (error || !metadata) {
        return (
            <NoticeBox error title={i18n.t('Could not load registration form')}>
                {i18n.t('The tracker program metadata could not be loaded.')}
            </NoticeBox>
        )
    }

    if (metadata.programTrackedEntityAttributes.length === 0) {
        return (
            <NoticeBox title={i18n.t('No attributes configured')}>
                {i18n.t(
                    'This tracker program does not expose any tracked entity attributes to capture.'
                )}
            </NoticeBox>
        )
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <ProgramRegistrationForm
                programId={programId}
                metadata={metadata}
                programStages={programStages}
                orgUnitId={orgUnitId}
                enrolledAt={enrolledAt}
                events={events}
                supplementaryData={supplementaryData}
                optionGroups={optionGroups}
                onValuesChange={onValuesChange}
            />
        </div>
    )
}
