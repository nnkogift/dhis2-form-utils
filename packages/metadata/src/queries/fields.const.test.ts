import { describe, expect, it } from 'vitest';
import {
    EVENT_PROGRAM_FIELDS,
    PROGRAM_RULE_FIELDS,
    PROGRAM_RULE_VARIABLE_FIELDS,
    PROGRAM_STAGE_FIELDS,
    PROGRAM_TEA_FIELDS,
    withExtraFields,
} from './fields.const';

describe('withExtraFields', () => {
    it('returns the base fields unchanged when no extras are given', () => {
        expect(withExtraFields('id,displayName')).toBe('id,displayName');
    });

    it('returns the base fields unchanged when extras is an empty array', () => {
        expect(withExtraFields('id,displayName', [])).toBe('id,displayName');
    });

    it('appends extra fields to the base', () => {
        expect(withExtraFields('id,displayName', ['code', 'shortName'])).toBe(
            'id,displayName,code,shortName'
        );
    });
});

describe('field constants', () => {
    it('PROGRAM_STAGE_FIELDS matches the expected fixture string', () => {
        expect(PROGRAM_STAGE_FIELDS).toBe(
            'id,displayName,programStageDataElements[id,compulsory,allowProvidedElsewhere,allowFutureDate,displayInReports,renderType,dataElement[id,displayName,displayFormName,valueType,description,optionSet[id,options[id,code,displayName]]]],programStageSections[id,displayName,sortOrder,renderType,programStageSectionDataElements[sortOrder,dataElement[id,displayName,displayFormName,valueType,description,optionSet[id,options[id,code,displayName]]]]]'
        );
    });

    it('EVENT_PROGRAM_FIELDS matches the expected fixture string', () => {
        expect(EVENT_PROGRAM_FIELDS).toBe(
            `id,displayName,code,shortName,programType,programStages[${PROGRAM_STAGE_FIELDS}]`
        );
    });

    it('PROGRAM_TEA_FIELDS matches the expected fixture string', () => {
        expect(PROGRAM_TEA_FIELDS).toBe(
            'id,displayName,trackedEntityType[id],displayIncidentDate,selectEnrollmentDatesInFuture,selectIncidentDatesInFuture,displayEnrollmentDateLabel,displayIncidentDateLabel,programTrackedEntityAttributes[id,mandatory,allowFutureDate,searchable,displayInList,sortOrder,renderType,renderOptionsAsRadio,trackedEntityAttribute[id,displayName,formName,valueType,optionSet[id,options[id,code,displayName]],unique,generated,fieldMask,confidential,orgunitScope]],programSections[id,displayName,sortOrder,trackedEntityAttributes[id]]'
        );
    });

    it('PROGRAM_RULE_FIELDS matches the expected fixture string', () => {
        expect(PROGRAM_RULE_FIELDS).toBe(
            'id,name,displayName,condition,priority,programStage[id],programRuleActions[id,programRuleActionType,priority,content,data,location,dataElement[id,displayName,valueType,optionSet[id,options[id,code,displayName]]],trackedEntityAttribute[id,displayName,valueType],option[id,code,displayName],optionGroup[id,displayName],programStageSection[id,displayName],programSection[id,displayName]]'
        );
    });

    it('PROGRAM_RULE_VARIABLE_FIELDS matches the expected fixture string', () => {
        expect(PROGRAM_RULE_VARIABLE_FIELDS).toBe(
            'id,name,valueType,useCodeForOptionSet,programRuleVariableSourceType,programStage[id,displayName],dataElement[id,displayName,valueType,optionSet[id,options[id,code,displayName]]],trackedEntityAttribute[id,displayName,valueType]'
        );
    });
});
