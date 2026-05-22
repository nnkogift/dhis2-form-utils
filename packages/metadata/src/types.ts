export type Dhis2ValueType =
    | 'TEXT'
    | 'LONG_TEXT'
    | 'INTEGER'
    | 'INTEGER_POSITIVE'
    | 'NUMBER'
    | 'BOOLEAN'
    | 'DATE'
    | 'ORGANISATION_UNIT'
    | 'FILE_RESOURCE';

export type DataElementRef = {
    id: string;
    displayName: string;
    valueType: Dhis2ValueType;
    optionSet?: {
        options?: Array<{
            id: string;
            code: string;
            displayName: string;
        }>;
    };
};

export type ProgramStageDataElement = {
    dataElement: DataElementRef;
};

export type ProgramStageMetadata = {
    id: string;
    displayName: string;
    programStageDataElements: ProgramStageDataElement[];
    programRules?: ProgramRule[];
    programRuleVariables?: ProgramRuleVariable[];
};

export type ProgramRuleActionType = string;

export type ProgramRuleAction = {
    programRuleActionType: ProgramRuleActionType;
    dataElement?: DataElementRef;
    trackedEntityAttribute?: {
        id: string;
        displayName?: string;
        valueType?: Dhis2ValueType;
    };
    option?: {
        id: string;
        code: string;
        displayName?: string;
    };
    optionGroup?: {
        id: string;
        displayName?: string;
    };
    programStageSection?: {
        id: string;
        displayName?: string;
    };
    programSection?: {
        id: string;
        displayName?: string;
    };
    content?: string;
    data?: string;
    priority?: number;
};

export type ProgramRule = {
    id: string;
    displayName?: string;
    condition?: string;
    priority?: number;
    programRuleActions?: ProgramRuleAction[];
};

export type ProgramRuleVariableSourceType =
    | 'DATAELEMENT_PREVIOUS_EVENT'
    | 'DATAELEMENT_CURRENT_EVENT'
    | 'DATAELEMENT_NEWEST_EVENT_PROGRAM'
    | 'DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE'
    | 'CALCULATED_VALUE'
    | 'TEI_ATTRIBUTE';

export type ProgramRuleVariable = {
    id: string;
    name: string;
    dataElement?: DataElementRef;
    trackedEntityAttribute?: {
        id: string;
        displayName?: string;
        valueType?: Dhis2ValueType;
    };
    programRuleVariableSourceType?: ProgramRuleVariableSourceType;
    useCodeForOptionSet?: boolean;
    programStage?: {
        id: string;
        displayName?: string;
    };
};
