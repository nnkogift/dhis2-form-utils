import i18n from '@dhis2/d2-i18n'
import { IconViewOff16 } from '@dhis2/ui'
import { GHOST_BACKGROUND_IMAGE } from './ghostBackground'

type HiddenSectionPlaceholderProps = {
    ruleName: string
}

export function HiddenSectionPlaceholder({
    ruleName,
}: HiddenSectionPlaceholderProps) {
    return (
        <div
            style={{ backgroundImage: GHOST_BACKGROUND_IMAGE }}
            className="flex items-center gap-2.5 rounded-[3px] border border-dashed border-dhis2-grey-400 px-3.5 py-3 text-xs text-dhis2-grey-600"
        >
            <IconViewOff16 aria-hidden="true" />
            <span>
                {i18n.t('Section hidden by')}{' '}
                <span className="font-semibold">{ruleName}</span>
            </span>
        </div>
    )
}
