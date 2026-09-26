import type {
    EventProgramMetadata,
    TrackerProgramMetadata,
} from '@nnkogift/dhis2-form-utils-metadata';
import { describe, expect, it } from 'vitest';
import type { CatalogRule } from '../../lib/resolveProgramRulesList';
import type { RuleDevtoolsMetadata } from '../../lib/createLabelLookup';
import { isProgramRuleScopeFilterEnabled, isRuleInScope } from './shared';

const catalogRule = (programStageId: string | null): CatalogRule => ({
    id: 'rule-1',
    name: 'Test rule',
    programRuleActions: [],
    programStageId,
});

const eventWithoutRegistration: RuleDevtoolsMetadata = {
    formKind: 'event',
    programStageId: 'stage-1',
    metadata: {
        id: 'prog-1',
        programType: 'WITHOUT_REGISTRATION',
        programRules: [],
        programRuleVariables: [],
    } as unknown as EventProgramMetadata,
};

const eventWithRegistration: RuleDevtoolsMetadata = {
    formKind: 'event',
    programStageId: 'stage-1',
    metadata: {
        id: 'prog-2',
        programType: 'WITH_REGISTRATION',
        programRules: [],
        programRuleVariables: [],
    } as unknown as EventProgramMetadata,
};

const trackerMetadata: RuleDevtoolsMetadata = {
    formKind: 'tracker',
    metadata: {
        id: 'tracker-1',
        programRules: [],
        programRuleVariables: [],
    } as unknown as TrackerProgramMetadata,
};

describe('isProgramRuleScopeFilterEnabled', () => {
    it('disables scope filtering for event WITHOUT_REGISTRATION programs', () => {
        expect(isProgramRuleScopeFilterEnabled(eventWithoutRegistration)).toBe(false);
    });

    it('keeps scope filtering for other event program types', () => {
        expect(isProgramRuleScopeFilterEnabled(eventWithRegistration)).toBe(true);
    });

    it('keeps scope filtering for tracker programs', () => {
        expect(isProgramRuleScopeFilterEnabled(trackerMetadata)).toBe(true);
    });
});

describe('isRuleInScope', () => {
    it('treats every rule as in scope when scope filtering is disabled', () => {
        const rule = catalogRule(null);
        expect(isRuleInScope(rule, 'stage-1', false)).toBe(true);
    });

    it('uses strict stage equality when scope filtering is enabled', () => {
        const registrationRule = catalogRule(null);
        const stageRule = catalogRule('stage-1');

        expect(isRuleInScope(registrationRule, 'stage-1', true)).toBe(false);
        expect(isRuleInScope(stageRule, 'stage-1', true)).toBe(true);
        expect(isRuleInScope(stageRule, null, true)).toBe(false);
    });
});
