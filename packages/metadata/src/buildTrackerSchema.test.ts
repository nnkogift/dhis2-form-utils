import { describe, expect, it } from 'vitest';
import { buildTrackerSchema } from './buildTrackerSchema';
import type { TrackerProgramMetadata } from './trackerTypes';

const baseMetadata = (): TrackerProgramMetadata => ({
    id: 'prog-1',
    displayName: 'Tracker Program',
    trackedEntityType: { id: 'te-type-1' },
    displayIncidentDate: false,
    selectEnrollmentDatesInFuture: true,
    selectIncidentDatesInFuture: true,
    programTrackedEntityAttributes: [],
    programRules: [],
    programRuleVariables: [],
});

describe('buildTrackerSchema', () => {
    it('omits occurredAt when displayIncidentDate is false', () => {
        const schema = buildTrackerSchema(baseMetadata());
        const shape = schema.shape;
        expect(shape).toHaveProperty('orgUnit');
        expect(shape).toHaveProperty('enrolledAt');
        expect(shape).not.toHaveProperty('occurredAt');
    });

    it('includes occurredAt when displayIncidentDate is true', () => {
        const schema = buildTrackerSchema({
            ...baseMetadata(),
            displayIncidentDate: true,
        });
        expect(schema.shape).toHaveProperty('occurredAt');
    });

    it('rejects empty mandatory TEA values', () => {
        const schema = buildTrackerSchema({
            ...baseMetadata(),
            programTrackedEntityAttributes: [
                {
                    mandatory: true,
                    trackedEntityAttribute: {
                        id: 'tea-name',
                        displayName: 'Name',
                        valueType: 'TEXT',
                    },
                },
            ],
        });

        const result = schema.safeParse({
            orgUnit: 'abcdefghijk',
            enrolledAt: '2024-01-15',
            'tea-name': '',
        });
        expect(result.success).toBe(false);
    });

    it('validates orgUnit length', () => {
        const schema = buildTrackerSchema(baseMetadata());
        expect(schema.safeParse({ orgUnit: 'short', enrolledAt: '2024-01-15' }).success).toBe(
            false
        );
        expect(schema.safeParse({ orgUnit: 'abcdefghijk', enrolledAt: '2024-01-15' }).success).toBe(
            true
        );
    });

    it('rejects future enrolledAt when selectEnrollmentDatesInFuture is false', () => {
        const schema = buildTrackerSchema({
            ...baseMetadata(),
            selectEnrollmentDatesInFuture: false,
        });
        const future = new Date();
        future.setFullYear(future.getFullYear() + 1);
        const futureIso = future.toISOString().slice(0, 10);

        expect(schema.safeParse({ orgUnit: 'abcdefghijk', enrolledAt: futureIso }).success).toBe(
            false
        );
        expect(schema.safeParse({ orgUnit: 'abcdefghijk', enrolledAt: '2020-01-01' }).success).toBe(
            true
        );
    });

    it('rejects future occurredAt when selectIncidentDatesInFuture is false', () => {
        const schema = buildTrackerSchema({
            ...baseMetadata(),
            displayIncidentDate: true,
            selectIncidentDatesInFuture: false,
        });
        const future = new Date();
        future.setFullYear(future.getFullYear() + 1);
        const futureIso = future.toISOString().slice(0, 10);

        expect(
            schema.safeParse({
                orgUnit: 'abcdefghijk',
                enrolledAt: '2020-01-01',
                occurredAt: futureIso,
            }).success
        ).toBe(false);
    });

    it('rejects future TEA dates when allowFutureDate is false', () => {
        const schema = buildTrackerSchema({
            ...baseMetadata(),
            programTrackedEntityAttributes: [
                {
                    mandatory: false,
                    allowFutureDate: false,
                    trackedEntityAttribute: {
                        id: 'tea-dob',
                        displayName: 'Date of birth',
                        valueType: 'DATE',
                    },
                },
            ],
        });
        const future = new Date();
        future.setFullYear(future.getFullYear() + 1);
        const futureIso = future.toISOString().slice(0, 10);

        expect(
            schema.safeParse({
                orgUnit: 'abcdefghijk',
                enrolledAt: '2020-01-01',
                'tea-dob': futureIso,
            }).success
        ).toBe(false);
        expect(
            schema.safeParse({
                orgUnit: 'abcdefghijk',
                enrolledAt: '2020-01-01',
                'tea-dob': '2020-01-01',
            }).success
        ).toBe(true);
    });
});
