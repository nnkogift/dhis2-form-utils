import type { components } from '@dhis2/api-types/v43';

type Schemas = components['schemas'];

/**
 * Subset of ProgramRuleAction fields needed by buildEnrollmentRuleEngineContext.
 * dataElement is excluded — enrollment rules target TEA attributes, not data elements.
 * programSection is extended separately — used by HIDESECTION but absent from OpenAPI v43.
 */
export type ExpandedProgramRuleAction = Pick<
    Schemas['ProgramRuleAction'],
    | 'id'
    | 'programRuleActionType'
    | 'data'
    | 'content'
    | 'trackedEntityAttribute'
    | 'programStageSection'
    | 'location'
> & {
    programSection?: {
        id: string;
    };
};

/**
 * ProgramRule with actions expanded inline.
 * Caller must request expanded fields when fetching program rules.
 */
export type ExpandedProgramRule = Pick<
    Schemas['ProgramRule'],
    'id' | 'condition' | 'priority' | 'name'
> & {
    programStage?: { id: string };
    programRuleActions: ExpandedProgramRuleAction[];
};

export type TrackerProgramMetadata = {
    id: string;
    displayName: string;
    trackedEntityType: { id: string };
    displayIncidentDate: boolean;
    selectEnrollmentDatesInFuture: boolean;
    selectIncidentDatesInFuture: boolean;
    displayEnrollmentDateLabel?: string;
    displayIncidentDateLabel?: string;
    programTrackedEntityAttributes: Array<
        Pick<
            Schemas['ProgramTrackedEntityAttributeParams'],
            | 'id'
            | 'mandatory'
            | 'allowFutureDate'
            | 'searchable'
            | 'displayInList'
            | 'sortOrder'
            | 'renderType'
            | 'renderOptionsAsRadio'
        > & {
            trackedEntityAttribute: Pick<
                Schemas['TrackedEntityAttributeParams'],
                | 'id'
                | 'displayName'
                | 'formName'
                | 'valueType'
                | 'optionSet'
                | 'unique'
                | 'generated'
                | 'fieldMask'
                | 'confidential'
                | 'orgunitScope'
            >;
        }
    >;
    programRules: ExpandedProgramRule[];
    programRuleVariables: Array<
        Pick<
            Schemas['ProgramRuleVariable'],
            | 'id'
            | 'name'
            | 'programRuleVariableSourceType'
            | 'trackedEntityAttribute'
            | 'valueType'
            | 'useCodeForOptionSet'
        >
    >;
    programSections?: Array<{
        id: string;
        displayName?: string;
        sortOrder?: number;
        trackedEntityAttributes: Array<{ id: string }>;
    }>;
};
