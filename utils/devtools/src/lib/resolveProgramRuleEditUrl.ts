const METADATA_MANAGEMENT_MIN_MINOR_VERSION = 43;

export type ProgramRuleEditorApp = 'maintenance' | 'metadata-management';

/** DHIS2 replaced the Maintenance app with the Metadata Management app starting in v43. */
export function resolveProgramRuleEditorApp(minorVersion: number): ProgramRuleEditorApp {
    return minorVersion >= METADATA_MANAGEMENT_MIN_MINOR_VERSION
        ? 'metadata-management'
        : 'maintenance';
}

export function resolveProgramRuleEditUrl(
    baseUrl: string,
    minorVersion: number,
    ruleId: string
): string {
    return resolveProgramRuleEditorApp(minorVersion) === 'metadata-management'
        ? `${baseUrl}/dhis-web-metadata-management/#/programRules/${ruleId}`
        : `${baseUrl}/dhis-web-maintenance/#/edit/programSection/programRule/${ruleId}`;
}
