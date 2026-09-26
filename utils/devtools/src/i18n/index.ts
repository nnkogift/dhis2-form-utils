import i18n from '@dhis2/d2-i18n';

type TranslateVariables = Record<string, string | number>;

export function translate(message: string, variables?: TranslateVariables): string {
    return String(i18n.t(message, variables));
}
