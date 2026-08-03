import type { EventProgramMetadata, ProgramStageMetadata } from '@dhis2-form-utils/metadata';
import ancEventJson from './anc.event.json';
import ancStageJson from './anc.stage.json';

export const ANC_PROGRAM_ID = 'lxAQ7Zs9VYR';
export const ANC_STAGE_ID = 'dBwrot7S420';
export const ANC_SMOKING_DE_ID = 'sWoqcoByYmD';
export const ANC_COUNSELLING_DE_ID = 'Ok9OQpitjQr';
export const ANC_HEMOGLOBIN_DE_ID = 'vANAXwtLwcT';

export const ancStageMetadata = ancStageJson as unknown as ProgramStageMetadata;
export const ancEventProgramMetadata = ancEventJson as unknown as EventProgramMetadata;
