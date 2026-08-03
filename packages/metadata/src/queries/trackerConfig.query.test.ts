import { describe, expect, it } from 'vitest';
import { trackerConfigQuery } from './trackerConfig.query';
import {
    CONSTANT_FIELDS,
    PROGRAM_RULE_FIELDS,
    PROGRAM_RULE_VARIABLE_FIELDS,
    PROGRAM_TEA_FIELDS,
} from './fields.const';

describe('trackerConfigQuery', () => {
    it('is a plain object, not a factory function', () => {
        expect(typeof trackerConfigQuery).toBe('object');
    });

    it('resolves the program resource id and fields from variables', () => {
        const variables = { programId: 'program1' };
        const program = trackerConfigQuery.program;

        if (typeof program.id !== 'function') {
            throw new Error('expected program.id to be a function');
        }

        expect(program.resource).toBe('programs');
        expect(program.id(variables)).toBe('program1');
        expect(program.params).toEqual({ fields: PROGRAM_TEA_FIELDS });
    });

    it('filters programRules by program.id and applies PROGRAM_RULE_FIELDS', () => {
        const variables = { programId: 'program1' };
        const programRules = trackerConfigQuery.programRules;

        if (typeof programRules.params !== 'function') {
            throw new Error('expected programRules.params to be a function');
        }

        expect(programRules.resource).toBe('programRules');
        expect(programRules.params(variables)).toEqual({
            fields: PROGRAM_RULE_FIELDS,
            filter: 'program.id:eq:program1',
            paging: false,
        });
    });

    it('filters programRuleVariables by program.id and applies PROGRAM_RULE_VARIABLE_FIELDS', () => {
        const variables = { programId: 'program1' };
        const programRuleVariables = trackerConfigQuery.programRuleVariables;

        if (typeof programRuleVariables.params !== 'function') {
            throw new Error('expected programRuleVariables.params to be a function');
        }

        expect(programRuleVariables.resource).toBe('programRuleVariables');
        expect(programRuleVariables.params(variables)).toEqual({
            fields: PROGRAM_RULE_VARIABLE_FIELDS,
            filter: 'program.id:eq:program1',
            paging: false,
        });
    });

    it('fetches constants as a global resource with no program filter', () => {
        const constants = trackerConfigQuery.constants;

        expect(constants.resource).toBe('constants');
        expect(constants.params).toEqual({ fields: CONSTANT_FIELDS, paging: false });
        expect(constants.params).not.toHaveProperty('filter');
    });
});
