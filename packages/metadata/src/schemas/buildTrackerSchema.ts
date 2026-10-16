import { z } from 'zod';
import type { TrackerProgramMetadata } from '../domain/trackerTypes';
import { buildFieldSchema } from './buildFieldSchema';
import { enrollmentDateSchema } from './dateRules';
import { withFriendlyMessages } from './friendlyMessages';
import { trackerFieldSchemaInput } from './toFieldSchemaInput';

export function buildTrackerSchema(metadata: TrackerProgramMetadata): z.ZodObject<z.ZodRawShape> {
    const shape: z.ZodRawShape = {
        orgUnit: withFriendlyMessages(z.string().length(11, 'Must be a valid organisation unit')),
        enrolledAt: withFriendlyMessages(
            enrollmentDateSchema(metadata.selectEnrollmentDatesInFuture)
        ),
    };

    for (const ptea of metadata.programTrackedEntityAttributes) {
        const teaId = ptea.trackedEntityAttribute.id;
        if (!teaId) continue;
        shape[teaId] = buildFieldSchema(trackerFieldSchemaInput(ptea));
    }

    if (metadata.displayIncidentDate) {
        shape.occurredAt = withFriendlyMessages(
            enrollmentDateSchema(metadata.selectIncidentDatesInFuture)
        );
    }

    return z.object(shape);
}
