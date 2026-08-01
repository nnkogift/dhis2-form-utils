import i18n from '@dhis2/d2-i18n'
import { GHOST_BACKGROUND_IMAGE } from './ghostBackground'

type HiddenFieldPlaceholderProps = {
    ruleName: string
}

export function HiddenFieldPlaceholder({
    ruleName,
}: HiddenFieldPlaceholderProps) {
    return (
        <div
            style={{ backgroundImage: GHOST_BACKGROUND_IMAGE }}
            className="flex h-9 items-center overflow-hidden rounded-[3px] border border-dashed border-dhis2-grey-400 px-2 text-xs text-dhis2-grey-600"
        >
            {i18n.t('Hidden by {{ruleName}}', { ruleName })}
        </div>
    )
}
