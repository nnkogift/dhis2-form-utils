import type { EventProgramMetadata, ProgramStageMetadata } from '@dhis2-form-utils/metadata';
import ancExport from './anc.json';
import {
    resolveMetadataExportEventProgram,
    resolveMetadataExportStage,
    type MetadataExport,
} from './resolveMetadataExport';

export const ANC_PROGRAM_ID = 'lxAQ7Zs9VYR';
export const ANC_STAGE_ID = 'dBwrot7S420';
export const ANC_SMOKING_DE_ID = 'sWoqcoByYmD';
export const ANC_COUNSELLING_DE_ID = 'Ok9OQpitjQr';
export const ANC_HEMOGLOBIN_DE_ID = 'vANAXwtLwcT';

const ancMetadataExport = ancExport as MetadataExport;

export function resolveAncStage(stageId: string): ProgramStageMetadata {
    return resolveMetadataExportStage(ancMetadataExport, stageId);
}

export function resolveAncEventProgram(): EventProgramMetadata {
    return resolveMetadataExportEventProgram(ancMetadataExport, ANC_PROGRAM_ID);
}

export const ancEventProgramMetadata = resolveAncEventProgram();
