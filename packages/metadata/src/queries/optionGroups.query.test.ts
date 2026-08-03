import { describe, expect, it } from 'vitest';
import { OPTION_GROUP_FIELDS, optionGroupsQuery } from './optionGroups.query';

describe('optionGroupsQuery', () => {
    it('is a plain object, not a factory function', () => {
        expect(typeof optionGroupsQuery).toBe('object');
    });

    it('filters optionGroups by the provided ids and applies OPTION_GROUP_FIELDS', () => {
        const variables = { optionGroupIds: ['og1', 'og2'] };
        const optionGroups = optionGroupsQuery.optionGroups;

        if (typeof optionGroups.params !== 'function') {
            throw new Error('expected optionGroups.params to be a function');
        }

        expect(optionGroups.resource).toBe('optionGroups');
        expect(optionGroups.params(variables)).toEqual({
            fields: OPTION_GROUP_FIELDS,
            filter: 'id:in:[og1,og2]',
            paging: false,
        });
    });
});
