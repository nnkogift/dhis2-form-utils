import type { ProgramRuleActionType as ApiProgramRuleActionType } from '@dhis2/api-types/v43';

/** Rule-engine action types including extensions not yet in the OpenAPI spec. */
export type ProgramRuleActionType =
    | ApiProgramRuleActionType
    | 'SHOWFIELD'
    | 'SHOWOPTION'
    | 'SHOWOPTIONGROUP'
    | 'UNSETMANDATORYFIELD';

/** Runtime values for program rule action types. */
export const ProgramRuleActionType = {
    HIDEFIELD: 'HIDEFIELD',
    HIDESECTION: 'HIDESECTION',
    HIDEPROGRAMSTAGE: 'HIDEPROGRAMSTAGE',
    SHOWFIELD: 'SHOWFIELD',
    SHOWWARNING: 'SHOWWARNING',
    SHOWERROR: 'SHOWERROR',
    WARNINGONCOMPLETE: 'WARNINGONCOMPLETE',
    ERRORONCOMPLETE: 'ERRORONCOMPLETE',
    ASSIGN: 'ASSIGN',
    DISPLAYTEXT: 'DISPLAYTEXT',
    DISPLAYKEYVALUEPAIR: 'DISPLAYKEYVALUEPAIR',
    HIDEOPTION: 'HIDEOPTION',
    HIDEOPTIONGROUP: 'HIDEOPTIONGROUP',
    SHOWOPTION: 'SHOWOPTION',
    SHOWOPTIONGROUP: 'SHOWOPTIONGROUP',
    SETMANDATORYFIELD: 'SETMANDATORYFIELD',
    UNSETMANDATORYFIELD: 'UNSETMANDATORYFIELD',
    SENDMESSAGE: 'SENDMESSAGE',
    SCHEDULEMESSAGE: 'SCHEDULEMESSAGE',
} as const satisfies Record<string, ProgramRuleActionType>;

/** DHIS2 programRuleVariableSourceType values (mirrors @dhis2/api-types). */
export const ProgramRuleVariableSourceType = {
    DATAELEMENT_PREVIOUS_EVENT: 'DATAELEMENT_PREVIOUS_EVENT',
    DATAELEMENT_CURRENT_EVENT: 'DATAELEMENT_CURRENT_EVENT',
    DATAELEMENT_NEWEST_EVENT_PROGRAM: 'DATAELEMENT_NEWEST_EVENT_PROGRAM',
    DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE: 'DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE',
    CALCULATED_VALUE: 'CALCULATED_VALUE',
    TEI_ATTRIBUTE: 'TEI_ATTRIBUTE',
} as const;

export type ProgramRuleVariableSourceType =
    (typeof ProgramRuleVariableSourceType)[keyof typeof ProgramRuleVariableSourceType];
