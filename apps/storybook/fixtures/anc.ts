import type { ProgramStageMetadata } from '@dhis2-form-utils/metadata';
import ancExport from './anc.json';
import { resolveMetadataExportStage, type MetadataExport } from './resolveMetadataExport';

export const ANC_STAGE_ID = 'dBwrot7S420';
export const ANC_SMOKING_DE_ID = 'sWoqcoByYmD';
export const ANC_COUNSELLING_DE_ID = 'Ok9OQpitjQr';
export const ANC_HEMOGLOBIN_DE_ID = 'vANAXwtLwcT';

export function resolveAncStage(stageId: string): ProgramStageMetadata {
    return resolveMetadataExportStage(ancExport as MetadataExport, stageId, 'anc');
}

export const ancStageMetadata = resolveAncStage(ANC_STAGE_ID);
