import type {
    EventProgramMetadata,
    ProgramStageMetadata,
    TrackerProgramMetadata,
} from '@dhis2-form-utils/metadata';
import childProgrammeEventJson from './child-programme.event.json';
import childProgrammeStageJson from './child-programme.stage.json';
import childProgrammeTrackerJson from './child-programme.tracker.json';

export const CHILD_PROGRAMME_PROGRAM_ID = 'IpHINAT79UW';
export const CHILD_PROGRAMME_STAGE_ID = 'A03MvHHogjR';
export const CHILD_FIRST_NAME_TEA_ID = 'w75KJ2mc4zz';
export const CHILD_LAST_NAME_TEA_ID = 'zDhUuAYrxNC';
export const CHILD_GENDER_TEA_ID = 'cejWyOfXge6';
export const CHILD_UNIQUE_ID_TEA_ID = 'lZGmxYbs97q';
export const APGAR_SCORE_DE_ID = 'a3kGcGDCuk6';
export const APGAR_COMMENT_DE_ID = 'H6uSAMO5WLD';
export const CHILD_REGISTRATION_DEFAULT_ORG_UNIT = 'DiszpKrYNg8';

export const childProgrammeStageMetadata =
    childProgrammeStageJson as unknown as ProgramStageMetadata;
export const childProgrammeEventProgramMetadata =
    childProgrammeEventJson as unknown as EventProgramMetadata;
export const childProgrammeProgramMetadata = childProgrammeTrackerJson as TrackerProgramMetadata;
