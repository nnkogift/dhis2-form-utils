import i18n from '@dhis2/d2-i18n';

export type TranslateVariables = Record<string, string | number>;

/** Translates an English message key through DHIS2's `@dhis2/d2-i18n` (a peer dependency). */
export function translate(message: string, variables?: TranslateVariables): string {
    return String(i18n.t(message, variables));
}
