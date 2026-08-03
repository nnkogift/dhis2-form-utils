import i18n from '@dhis2/d2-i18n'
import {
    EFFECT_ICONS,
    getEffectVariant,
    getEffectVisual,
    type EffectVisualVariant,
} from '@dhis2-form-utils/devtools'
import type { ProgramRuleActionType } from '@dhis2-form-utils/metadata'

const BADGE_LABELS: Partial<Record<EffectVisualVariant, string>> = {
    hide: i18n.t('Hidden'),
    show: i18n.t('Shown'),
    assign: i18n.t('Assigned'),
    mandatory: i18n.t('Required by rule'),
    warning: i18n.t('Warning'),
    error: i18n.t('Error'),
}

type FieldEffectBadgeProps = {
    actionType: ProgramRuleActionType
    ruleName: string
}

export function FieldEffectBadge({
    actionType,
    ruleName,
}: FieldEffectBadgeProps) {
    const variant = getEffectVariant(actionType)
    const visual = getEffectVisual(actionType)
    const Icon = EFFECT_ICONS[variant]
    const label = BADGE_LABELS[variant] ?? visual.shortLabel

    return (
        <span
            title={`${i18n.t('{{actionType}} from rule', { actionType })}: ${ruleName}`}
            className={`inline-flex shrink-0 items-center gap-1 rounded text-[11px] font-semibold leading-4 px-1.5 py-0.5 ${visual.tagClassName}`}
        >
            <Icon aria-hidden="true" />
            {label}
        </span>
    )
}
