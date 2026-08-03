import { describe, expect, it } from 'vitest';
import type { DevtoolsLabelLookup } from './createLabelLookup';
import { formatRuleActionSummary } from './formatRuleActionSummary';

const labelLookup: DevtoolsLabelLookup = {
    resolveRuleName: (id) => `rule:${id}`,
    resolveFieldName: (id) => `field:${id}`,
    resolveSectionName: (id) => `section:${id}`,
    resolveStageName: (id) => `stage:${id}`,
};

describe('formatRuleActionSummary', () => {
    it('formats HIDEFIELD with data element target', () => {
        expect(
            formatRuleActionSummary(
                {
                    programRuleActionType: 'HIDEFIELD',
                    dataElement: { id: 'de-age', displayName: 'Age' },
                },
                labelLookup
            )
        ).toEqual({
            type: 'HIDEFIELD',
            targetLabel: 'field:de-age',
        });
    });

    it('formats ASSIGN with data and target', () => {
        expect(
            formatRuleActionSummary(
                {
                    programRuleActionType: 'ASSIGN',
                    dataElement: { id: 'de-weight' },
                    data: '70',
                },
                labelLookup
            )
        ).toEqual({
            type: 'ASSIGN',
            targetLabel: 'field:de-weight',
            detail: '70',
        });
    });

    it('formats HIDESECTION with section target', () => {
        expect(
            formatRuleActionSummary(
                {
                    programRuleActionType: 'HIDESECTION',
                    programStageSection: { id: 'section-a', displayName: 'Clinical' },
                },
                labelLookup
            )
        ).toEqual({
            type: 'HIDESECTION',
            targetLabel: 'section:section-a',
        });
    });

    it('formats DISPLAYTEXT with location and content', () => {
        expect(
            formatRuleActionSummary({
                programRuleActionType: 'DISPLAYTEXT',
                location: 'feedback',
                content: 'Warning message',
            })
        ).toEqual({
            type: 'DISPLAYTEXT',
            targetLabel: 'feedback',
            detail: 'Warning message',
        });
    });

    it('falls back to displayName when label lookup returns raw id', () => {
        expect(
            formatRuleActionSummary({
                programRuleActionType: 'SHOWWARNING',
                trackedEntityAttribute: {
                    id: 'unknown-tea',
                    displayName: 'First name',
                },
            })
        ).toEqual({
            type: 'SHOWWARNING',
            targetLabel: 'First name',
        });
    });
});
