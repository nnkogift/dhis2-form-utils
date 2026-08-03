import i18n from '@dhis2/d2-i18n'

type ErrorWithDetails = {
    message?: string
    details?: {
        response?: {
            message?: string
            errorReports?: Array<{ message?: string }>
        }
    }
}

export function formatDhis2Error(error: unknown): string {
    const typedError = error as ErrorWithDetails | undefined
    const errorReports = typedError?.details?.response?.errorReports

    if (errorReports && errorReports.length > 0) {
        return errorReports
            .map((report) => report.message)
            .filter(Boolean)
            .join(' ')
    }

    if (typedError?.details?.response?.message) {
        return typedError.details.response.message
    }

    if (typedError?.message) {
        return typedError.message
    }

    return i18n.t('An unexpected error occurred')
}
