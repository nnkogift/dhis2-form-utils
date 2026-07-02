import type { ProgramStageMetadata } from '@dhis2-form-utils/metadata';
import childProgrammeExport from './child-programme.json';
import {
    resolveMetadataExportProgram,
    resolveMetadataExportStage,
    type MetadataExport,
} from './resolveMetadataExport';

export const CHILD_PROGRAMME_PROGRAM_ID = 'IpHINAT79UW';
export const CHILD_PROGRAMME_STAGE_ID = 'A03MvHHogjR';
export const CHILD_FIRST_NAME_TEA_ID = 'w75KJ2mc4zz';
export const CHILD_LAST_NAME_TEA_ID = 'zDhUuAYrxNC';
export const CHILD_GENDER_TEA_ID = 'cejWyOfXge6';
export const CHILD_UNIQUE_ID_TEA_ID = 'lZGmxYbs97q';
export const APGAR_SCORE_DE_ID = 'a3kGcGDCuk6';
export const APGAR_COMMENT_DE_ID = 'H6uSAMO5WLD';
export const CHILD_REGISTRATION_DEFAULT_ORG_UNIT = 'DiszpKrYNg8';

const childExport = childProgrammeExport as MetadataExport;

export function resolveChildProgrammeStage(stageId: string): ProgramStageMetadata {
    return resolveMetadataExportStage(childExport, stageId, 'child-programme');
}

export function resolveChildProgrammeProgram(programId: string) {
    return resolveMetadataExportProgram(childExport, programId, 'child-programme');
}

export const childProgrammeStageMetadata = resolveChildProgrammeStage(CHILD_PROGRAMME_STAGE_ID);
export const childProgrammeProgramMetadata = resolveChildProgrammeProgram(
    CHILD_PROGRAMME_PROGRAM_ID
);
