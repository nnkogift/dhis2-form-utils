import { z } from 'zod';
import type { TrackerProgramMetadata } from '../domain/trackerTypes';
import { buildFieldSchema } from './buildFieldSchema';
import { enrollmentDateSchema } from './dateRules';
import { trackerFieldSchemaInput } from './toFieldSchemaInput';

export function buildTrackerSchema(metadata: TrackerProgramMetadata): z.ZodObject<z.ZodRawShape> {
    const shape: z.ZodRawShape = {
        orgUnit: z.string().min(11).max(11),
        enrolledAt: enrollmentDateSchema(metadata.selectEnrollmentDatesInFuture),
    };

    for (const ptea of metadata.programTrackedEntityAttributes) {
        const teaId = ptea.trackedEntityAttribute.id;
        if (!teaId) continue;
        shape[teaId] = buildFieldSchema(trackerFieldSchemaInput(ptea));
    }

    if (metadata.displayIncidentDate) {
        shape.occurredAt = enrollmentDateSchema(metadata.selectIncidentDatesInFuture);
    }

    return z.object(shape);
}
