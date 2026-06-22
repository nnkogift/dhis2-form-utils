import type { ProgramStageMetadata } from '@dhis2-form-utils/metadata';
import childProgrammeExport from './child-programme.json';
import { resolveMetadataExportStage, type MetadataExport } from './resolveMetadataExport';

export const CHILD_PROGRAMME_STAGE_ID = 'A03MvHHogjR';
export const APGAR_SCORE_DE_ID = 'a3kGcGDCuk6';
export const APGAR_COMMENT_DE_ID = 'H6uSAMO5WLD';

export function resolveChildProgrammeStage(stageId: string): ProgramStageMetadata {
    return resolveMetadataExportStage(
        childProgrammeExport as MetadataExport,
        stageId,
        'child-programme'
    );
}

export const childProgrammeStageMetadata = resolveChildProgrammeStage(CHILD_PROGRAMME_STAGE_ID);
