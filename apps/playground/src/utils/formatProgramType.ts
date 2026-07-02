import i18n from '@dhis2/d2-i18n'
import { PROGRAM_TYPE, type ProgramType } from '@/types/program'

export function formatProgramType(programType: ProgramType | string): string {
    if (programType === PROGRAM_TYPE.WITH_REGISTRATION) {
        return i18n.t('Registration')
    }

    if (programType === PROGRAM_TYPE.WITHOUT_REGISTRATION) {
        return i18n.t('Event')
    }

    return programType
}
