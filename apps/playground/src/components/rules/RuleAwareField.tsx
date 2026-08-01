import i18n from '@dhis2/d2-i18n'
import { D2FieldWidget } from '@dhis2-form-utils/dhis2-ui'
import {
    type FieldControlInput,
    useFieldControl,
    useFieldRuleEffect,
} from '@dhis2-form-utils/hooks'
import { FieldEffectBadge } from './FieldEffectBadge'
import { HiddenFieldPlaceholder } from './HiddenFieldPlaceholder'
import { useRuleDisplay } from './RuleDisplayContext'

type RuleAwareFieldProps = {
    field: FieldControlInput
}

export function RuleAwareField({ field }: RuleAwareFieldProps) {
    const control = useFieldControl(field)
    const ruleEffect = useFieldRuleEffect(control.fieldId)
    const { ghostsEnabled, labelLookup } = useRuleDisplay()

    if (control.isHidden && !ghostsEnabled) {
        return null
    }

    const ruleName = ruleEffect
        ? labelLookup.resolveRuleName(ruleEffect.ruleId)
        : null
    const label = control.fieldConfig.label
    // The widget below already renders `fieldConfig.label` as its own <label>; this
    // wrapper owns the label row instead (text + badge), so the widget's copy is blanked.
    const widgetControl = {
        ...control,
        fieldConfig: { ...control.fieldConfig, label: '' },
    }

    return (
        <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex min-w-0 items-center gap-2">
                <span
                    className={`text-sm leading-5 ${control.isHidden ? 'text-dhis2-grey-600' : 'text-dhis2-grey-900'}`}
                >
                    {label}
                </span>
                {ruleEffect && ruleName ? (
                    <FieldEffectBadge
                        actionType={ruleEffect.ruleActionType}
                        ruleName={ruleName}
                    />
                ) : null}
            </div>
            {control.isHidden ? (
                <HiddenFieldPlaceholder
                    ruleName={ruleName ?? i18n.t('a rule')}
                />
            ) : (
                <D2FieldWidget control={widgetControl} />
            )}
        </div>
    )
}
