import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip, NoticeBox } from '@dhis2/ui'
import { useFormState } from 'react-hook-form'

type ProgramFormActionsProps = {
    submitLabel: string
    errorTitle: string
    successMessage?: string
    successTitle?: string
}

export function ProgramFormActions({
    submitLabel,
    errorTitle,
    successMessage,
    successTitle = i18n.t('Saved'),
}: ProgramFormActionsProps) {
    const { isSubmitting, errors } = useFormState()

    return (
        <>
            {errors.root?.message ? (
                <NoticeBox error title={errorTitle}>
                    {errors.root.message}
                </NoticeBox>
            ) : null}
            {successMessage ? (
                <NoticeBox title={successTitle}>{successMessage}</NoticeBox>
            ) : null}
            <ButtonStrip end>
                <Button
                    primary
                    type="submit"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                >
                    {submitLabel}
                </Button>
            </ButtonStrip>
        </>
    )
}
