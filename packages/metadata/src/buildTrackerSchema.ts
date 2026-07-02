import { z } from 'zod';
import { buildTeaFieldSchema, enrollmentDateSchema } from './buildTeaFieldSchema';
import type { TrackerProgramMetadata } from './trackerTypes';

export function buildTrackerSchema(metadata: TrackerProgramMetadata): z.ZodObject<z.ZodRawShape> {
    const shape: z.ZodRawShape = {
        orgUnit: z.string().min(11).max(11),
        enrolledAt: enrollmentDateSchema(metadata.selectEnrollmentDatesInFuture),
    };

    for (const {
        trackedEntityAttribute,
        mandatory,
        allowFutureDate,
    } of metadata.programTrackedEntityAttributes) {
        const teaId = trackedEntityAttribute.id;
        if (!teaId) continue;

        shape[teaId] = buildTeaFieldSchema(
            trackedEntityAttribute,
            mandatory ?? false,
            allowFutureDate ?? true
        );
    }

    if (metadata.displayIncidentDate) {
        shape.occurredAt = enrollmentDateSchema(metadata.selectIncidentDatesInFuture);
    }

    return z.object(shape);
}
