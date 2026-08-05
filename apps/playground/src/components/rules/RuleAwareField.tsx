import i18n from '@dhis2/d2-i18n'
import { D2FieldWidget } from '@nnkogift/dhis2-form-utils-dhis2-ui'
import {
    type FieldControlInput,
    useFieldControl,
    useFieldRuleEffect,
} from '@nnkogift/dhis2-form-utils-hooks'
import { useEffect, useId, useRef } from 'react'
import { FieldEffectBadge } from './FieldEffectBadge'
import { HiddenFieldPlaceholder } from './HiddenFieldPlaceholder'
import { useRuleDisplay } from './RuleDisplayContext'

type RuleAwareFieldProps = {
    field: FieldControlInput
}

// Matches the interactive element every D2*Field widget ultimately renders:
// InputField/TextAreaField-based widgets render <input>/<textarea>, the custom
// SingleSelectField renders this data-test'd div. A <fieldset> (the radio-group
// render hint) is excluded — its own <legend> already names the group natively.
const WIDGET_TARGET_SELECTOR =
    'input, textarea, [data-test="dhis2-uicore-select-input"]'

export function RuleAwareField({ field }: RuleAwareFieldProps) {
    const control = useFieldControl(field)
    const ruleEffect = useFieldRuleEffect(control.fieldId)
    const { ghostsEnabled, labelLookup } = useRuleDisplay()
    const labelId = useId()
    const widgetContainerRef = useRef<HTMLDivElement>(null)

    // The widget below has its own `fieldConfig.label` blanked (see widgetControl) so it
    // doesn't render a second, visually duplicate label — this row is the only visible
    // label. @dhis2/ui's field components don't accept an aria-label/aria-labelledby prop,
    // so once the label is blanked they render no accessible name at all for the
    // underlying input. Restore it by wiring aria-labelledby to this span directly on
    // whichever interactive element the widget actually rendered.
    useEffect(() => {
        const container = widgetContainerRef.current
        if (!container || container.querySelector('fieldset')) {
            return
        }
        container
            .querySelector<HTMLElement>(WIDGET_TARGET_SELECTOR)
            ?.setAttribute('aria-labelledby', labelId)
    })

    if (control.isHidden && !ghostsEnabled) {
        return null
    }

    const ruleName = ruleEffect
        ? labelLookup.resolveRuleName(ruleEffect.ruleId)
        : null
    const label = control.fieldConfig.label
    const widgetControl = {
        ...control,
        fieldConfig: { ...control.fieldConfig, label: '' },
    }

    return (
        <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex min-w-0 items-center gap-2">
                <span
                    id={labelId}
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
                <div ref={widgetContainerRef}>
                    <D2FieldWidget control={widgetControl} />
                </div>
            )}
        </div>
    )
}
