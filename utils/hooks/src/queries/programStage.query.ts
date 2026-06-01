import type { Query } from '@dhis2/data-engine';

export const programStageQuery = (id: string): Query => ({
    programStage: {
        resource: 'programStages',
        id,
        params: {
            fields: [
                'id,displayName',
                'programStageDataElements[dataElement[id,displayName,valueType,optionSet[options[code,displayName]]]]',
                [
                    'programRules[id,displayName,condition,priority,programRuleActions[',
                    'programRuleActionType,priority,content,data,',
                    'dataElement[id,displayName,valueType,optionSet[options[id,code,displayName]]],',
                    'trackedEntityAttribute[id,displayName,valueType],',
                    'option[id,code,displayName],',
                    'optionGroup[id,displayName],',
                    'programStageSection[id,displayName],',
                    'programSection[id,displayName]',
                    ']]',
                ].join(''),
                [
                    'programRuleVariables[',
                    'id,name,useCodeForOptionSet,programRuleVariableSourceType,',
                    'programStage[id,displayName],',
                    'dataElement[id,displayName,valueType,optionSet[options[id,code,displayName]]],',
                    'trackedEntityAttribute[id,displayName,valueType]',
                    ']',
                ].join(''),
            ].join(','),
        },
    },
});
