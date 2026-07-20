import i18n from '@dhis2/d2-i18n'
import type { ReactNode } from 'react'

type FormSectionCardProps = {
    title?: string
    children: ReactNode
}

export function FormSectionCard({ title, children }: FormSectionCardProps) {
    return (
        <section className="flex flex-col gap-dp16 rounded border border-dhis2-grey-400 p-dp16">
            {title ? (
                <h3 className="m-0 text-lg font-medium">{title}</h3>
            ) : null}
            {children}
        </section>
    )
}

export function defaultSectionTitle(displayName?: string) {
    return displayName ?? i18n.t('Section')
}
