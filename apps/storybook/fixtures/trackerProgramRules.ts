import { resolveTrackerProgramMetadata } from '@dhis2-form-utils/metadata';
import trackerProgramRulesJson from './tracker-program-rules-example.json';
import { buildRawTrackerConfig } from './metadataExport';
import type { MetadataExport } from './metadataExport';

export const TRACKER_RULES_PROGRAM_ID = 'XQpDo4JXQra';
export const TRACKER_RULES_DEFAULT_ORG_UNIT = 'DiszpKrYNg8';

export const TRACKER_RULES_FIRST_NAME_TEA_ID = 'EBCNXQ9jIU9';
export const TRACKER_RULES_AGE_TEA_ID = 'CMGH8KxOLqD';
export const TRACKER_RULES_PHONE_TEA_ID = 'KjzHTj1l4rm';
export const TRACKER_RULES_CONSENT_TEA_ID = 'tfwDGlUN1oP';
export const TRACKER_RULES_NOTES_TEA_ID = 'PlnbKMpQ3Pw';
export const TRACKER_RULES_RISK_SCORE_TEA_ID = 'yDuDBSTB1nR';
export const TRACKER_RULES_OCCUPATION_TEA_ID = 'oIm3pi3YFlS';

const exportData = trackerProgramRulesJson as MetadataExport;

export const trackerProgramRulesMetadata = resolveTrackerProgramMetadata(
    buildRawTrackerConfig(exportData, TRACKER_RULES_PROGRAM_ID)
);
