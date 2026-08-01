import type { EventProgramMetadata, TrackerProgramMetadata } from '@dhis2-form-utils/metadata';
import { describe, expect, it } from 'vitest';
import { createLabelLookup } from './createLabelLookup';

const eventMetadata = {
    id: 'prog-1',
    displayName: 'Event Program',
    programType: 'WITHOUT_REGISTRATION',
    programStages: [
        {
            id: 'stage-1',
            displayName: 'Stage 1',
            programStageDataElements: [
                {
                    dataElement: {
                        id: 'de-weight',
                        displayName: 'Weight',
                        displayFormName: 'Weight (kg)',
                        valueType: 'NUMBER',
                    },
                },
            ],
            programStageSections: [{ id: 'section-a', displayName: 'Clinical data' }],
        },
    ],
    programRules: [{ id: 'rule-1', displayName: 'Weight warning', condition: 'true' }],
    programRuleVariables: [],
} as unknown as EventProgramMetadata;

const trackerMetadata = {
    id: 'tracker-1',
    displayName: 'Tracker Program',
    trackedEntityType: { id: 'person' },
    displayIncidentDate: false,
    selectEnrollmentDatesInFuture: false,
    selectIncidentDatesInFuture: false,
    programTrackedEntityAttributes: [
        {
            trackedEntityAttribute: {
                id: 'tea-first-name',
                displayName: 'First name',
                formName: 'Given name',
                valueType: 'TEXT',
            },
        },
    ],
    programRules: [
        { id: 'rule-t1', name: 'Name required', condition: 'true', programRuleActions: [] },
    ],
    programRuleVariables: [],
    programSections: [
        { id: 'section-reg', displayName: 'Registration', trackedEntityAttributes: [] },
    ],
} as unknown as TrackerProgramMetadata;

describe('createLabelLookup', () => {
    it('resolves event field, section, and rule names from metadata', () => {
        const lookup = createLabelLookup({
            formKind: 'event',
            metadata: eventMetadata,
            programStageId: 'stage-1',
        });

        expect(lookup.resolveFieldName('de-weight')).toBe('Weight (kg)');
        expect(lookup.resolveSectionName('section-a')).toBe('Clinical data');
        expect(lookup.resolveRuleName('rule-1')).toBe('Weight warning');
        expect(lookup.resolveStageName('stage-1')).toBe('Stage 1');
    });

    it('resolves tracker field, section, and rule names from metadata', () => {
        const lookup = createLabelLookup({
            formKind: 'tracker',
            metadata: trackerMetadata,
            programStages: [{ id: 'stage-1', displayName: 'Stage 1' }],
        });

        expect(lookup.resolveFieldName('tea-first-name')).toBe('Given name');
        expect(lookup.resolveSectionName('section-reg')).toBe('Registration');
        expect(lookup.resolveRuleName('rule-t1')).toBe('Name required');
        expect(lookup.resolveStageName('stage-1')).toBe('Stage 1');
    });

    it('falls back to raw id for unknown keys', () => {
        const lookup = createLabelLookup({
            formKind: 'event',
            metadata: eventMetadata,
            programStageId: 'stage-1',
        });

        expect(lookup.resolveFieldName('unknown-de')).toBe('unknown-de');
        expect(lookup.resolveSectionName('unknown-section')).toBe('unknown-section');
        expect(lookup.resolveRuleName('unknown-rule')).toBe('unknown-rule');
    });

    it('leaves system field keys as raw ids', () => {
        const lookup = createLabelLookup({
            formKind: 'tracker',
            metadata: trackerMetadata,
        });

        expect(lookup.resolveFieldName('orgUnit')).toBe('orgUnit');
        expect(lookup.resolveFieldName('enrolledAt')).toBe('enrolledAt');
    });
});
