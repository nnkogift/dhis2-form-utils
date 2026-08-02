const LAST_UPDATED_FORMATTER = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
})

export function formatLastUpdated(isoDate: string): string {
    if (!isoDate) {
        return ''
    }

    const date = new Date(isoDate)
    if (Number.isNaN(date.getTime())) {
        return ''
    }

    return LAST_UPDATED_FORMATTER.format(date)
}
