import { describe, expect, it } from 'vitest';
import {
    resolveProgramRuleEditorApp,
    resolveProgramRuleEditUrl,
} from './resolveProgramRuleEditUrl';

const BASE_URL = 'https://play.dhis2.org/demo';
const RULE_ID = 'ruleAbc123';

describe('resolveProgramRuleEditorApp', () => {
    it('resolves to maintenance for versions below 43', () => {
        expect(resolveProgramRuleEditorApp(42)).toBe('maintenance');
    });

    it('resolves to metadata-management for version 43 and above', () => {
        expect(resolveProgramRuleEditorApp(43)).toBe('metadata-management');
        expect(resolveProgramRuleEditorApp(44)).toBe('metadata-management');
    });

    it('falls back to maintenance when the minor version is unknown (0)', () => {
        expect(resolveProgramRuleEditorApp(0)).toBe('maintenance');
    });
});

describe('resolveProgramRuleEditUrl', () => {
    it('builds a Maintenance app edit URL for v42 and below', () => {
        expect(resolveProgramRuleEditUrl(BASE_URL, 42, RULE_ID)).toBe(
            `${BASE_URL}/dhis-web-maintenance/#/edit/programSection/programRule/${RULE_ID}`
        );
    });

    it('builds a Metadata Management app edit URL for v43 and above', () => {
        expect(resolveProgramRuleEditUrl(BASE_URL, 43, RULE_ID)).toBe(
            `${BASE_URL}/dhis-web-metadata-management/#/programRules/${RULE_ID}`
        );
    });

    it('defaults to the Maintenance app URL when the minor version is unknown (0)', () => {
        expect(resolveProgramRuleEditUrl(BASE_URL, 0, RULE_ID)).toBe(
            `${BASE_URL}/dhis-web-maintenance/#/edit/programSection/programRule/${RULE_ID}`
        );
    });
});
