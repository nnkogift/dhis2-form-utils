import type { Query } from '@dhis2/data-engine';

export const programStageQuery = (id: string): Query => ({
  programStage: {
    resource: 'programStages',
    id,
    params: {
      fields: [
        'id,displayName',
        'programStageDataElements[dataElement[id,displayName,valueType,optionSet[options[code,displayName]]]]',
        'programRules[id,condition,priority,programRuleActions[programRuleActionType,dataElement,content,data]]',
        'programRuleVariables[id,name,dataElement,programRuleVariableSourceType]',
      ].join(','),
    },
  },
});
