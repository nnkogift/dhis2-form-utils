import type { ReactNode } from 'react'
import i18n from '@dhis2/d2-i18n'
import {
    useSectionRuleEffect,
    useSectionState,
} from '@nnkogift/dhis2-form-utils-hooks'
import { HiddenSectionPlaceholder } from '@/components/rules/HiddenSectionPlaceholder'
import { useRuleDisplay } from '@/components/rules/RuleDisplayContext'

type FormSectionCardProps = {
    sectionId: string
    title?: string
    note?: string
    children: ReactNode
}

export function FormSectionCard({
    sectionId,
    title,
    note,
    children,
}: FormSectionCardProps) {
    const state = useSectionState(sectionId)
    const ruleEffect = useSectionRuleEffect(sectionId)
    const { ghostsEnabled, labelLookup } = useRuleDisplay()

    if (state.hidden && !ghostsEnabled) {
        return null
    }

    const ruleName = ruleEffect
        ? labelLookup.resolveRuleName(ruleEffect.ruleId)
        : null

    return (
        <section className="flex-shrink-0 overflow-hidden rounded-[3px] border border-dhis2-grey-300 bg-white shadow-[0_1px_2px_rgba(33,41,52,0.06)]">
            <header className="flex items-center justify-between gap-3 border-b border-dhis2-grey-200 px-4 py-3">
                {title ? (
                    <h3 className="m-0 text-[15px] font-semibold">{title}</h3>
                ) : null}
                {note ? (
                    <span className="text-xs text-dhis2-grey-600">{note}</span>
                ) : null}
            </header>
            {state.hidden ? (
                <div className="m-4">
                    <HiddenSectionPlaceholder
                        ruleName={ruleName ?? i18n.t('a rule')}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-x-5 gap-y-4 p-4">
                    {children}
                </div>
            )}
        </section>
    )
}

export function defaultSectionTitle(displayName?: string) {
    return displayName ?? i18n.t('Section')
}
