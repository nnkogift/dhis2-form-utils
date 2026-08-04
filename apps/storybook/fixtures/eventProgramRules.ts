import { resolveEventProgramMetadata } from '@dhis2-form-utils/metadata';
import eventProgramRulesJson from './event-program-rules-example.json';
import { buildOptionGroupCodeMap, buildRawEventProgramConfig } from './metadataExport';
import type { MetadataExport } from './metadataExport';

export const EVENT_RULES_PROGRAM_ID = 'xo87zwzLEqc';
export const EVENT_RULES_STAGE_ID = 'kMag6BUwNgH';

export const EVENT_RULES_TOGGLE_HIDE_FIELD_DE_ID = 'CRPvieGoVZb';
export const EVENT_RULES_TOGGLE_HIDE_SECTION_DE_ID = 'eUjDjDsjC78';
export const EVENT_RULES_NUMBER_DE_ID = 'whUEYdoURdQ';
export const EVENT_RULES_TRIGGER_TEXT_DE_ID = 'Np1H391NjPi';
export const EVENT_RULES_COLOUR_DE_ID = 'MZrYHJoBYQG';
export const EVENT_RULES_HIDE_TARGET_DE_ID = 'sKYuUOftlgO';
export const EVENT_RULES_ASSIGNED_VALUE_DE_ID = 'rhmbkRxkgFT';
export const EVENT_RULES_MANDATORY_TARGET_DE_ID = 'ikV37IrPaOv';

const exportData = eventProgramRulesJson as MetadataExport;

export const eventProgramRulesMetadata = resolveEventProgramMetadata(
    buildRawEventProgramConfig(exportData, EVENT_RULES_PROGRAM_ID)
);

export const eventProgramRulesOptionGroups = buildOptionGroupCodeMap(exportData);
