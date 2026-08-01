import { useMemo } from 'react'
import i18n from '@dhis2/d2-i18n'
import { IconMessages16 } from '@dhis2/ui'
import {
    createLabelLookup,
    type DevtoolsLabelLookup,
    type RuleDevtoolsMetadata,
} from '@dhis2-form-utils/devtools'
import { useFormFeedback, useRuleEffectTrace } from '@dhis2-form-utils/hooks'
import { feedbackItemKey } from '@dhis2-form-utils/rules'

type RuleFeedbackListProps = {
    metadata: RuleDevtoolsMetadata
}

type FeedbackItem = ReturnType<typeof useFormFeedback>[string]

function FeedbackRow({
    item,
    labelLookup,
}: {
    item: FeedbackItem
    labelLookup: DevtoolsLabelLookup
}) {
    const ruleEffect = useRuleEffectTrace(feedbackItemKey(item))
    const ruleName = ruleEffect
        ? labelLookup.resolveRuleName(ruleEffect.ruleId)
        : null
    const sourceLabel =
        item.type === 'text'
            ? i18n.t('Display text')
            : i18n.t('Display key-value pair')

    return (
        <div className="flex items-start gap-2.5 rounded-[3px] bg-dhis2-purple-050 px-3.5 py-2.5 shadow-[inset_0_0_0_1px_#e1bee7]">
            <span className="mt-px shrink-0 text-dhis2-purple-900">
                <IconMessages16 aria-hidden="true" />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm leading-snug text-dhis2-grey-900">
                    {item.type === 'text' ? (
                        <strong className="font-semibold">
                            {item.content}
                        </strong>
                    ) : (
                        <>
                            <strong className="font-semibold">
                                {item.content}:{' '}
                            </strong>
                            {item.value}
                        </>
                    )}
                </span>
                <span className="text-xs text-dhis2-grey-600">
                    {ruleName
                        ? i18n.t('{{sourceLabel}} · {{ruleName}}', {
                              sourceLabel,
                              ruleName,
                          })
                        : sourceLabel}
                </span>
            </div>
        </div>
    )
}

export function RuleFeedbackList({ metadata }: RuleFeedbackListProps) {
    const labelLookup = useMemo(() => createLabelLookup(metadata), [metadata])
    const feedback = useFormFeedback()
    const items = Object.values(feedback)
    const feedbackItems = items.filter((item) => item.location === 'feedback')
    const indicatorItems = items.filter(
        (item) => item.location === 'indicators'
    )

    if (!feedbackItems.length && !indicatorItems.length) {
        return null
    }

    return (
        <div className="flex flex-col gap-dp8">
            {feedbackItems.map((item) => (
                <FeedbackRow
                    key={feedbackItemKey(item)}
                    item={item}
                    labelLookup={labelLookup}
                />
            ))}
            {indicatorItems.length > 0 ? (
                <div className="flex flex-col gap-dp8">
                    <span className="text-xs font-bold uppercase tracking-wide text-dhis2-grey-600">
                        {i18n.t('Program indicators')}
                    </span>
                    {indicatorItems.map((item) => (
                        <FeedbackRow
                            key={feedbackItemKey(item)}
                            item={item}
                            labelLookup={labelLookup}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    )
}
