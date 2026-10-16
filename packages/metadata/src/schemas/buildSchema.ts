import { z } from 'zod';
import type { ProgramStageMetadata } from '../domain/types';
import { buildFieldSchema } from './buildFieldSchema';
import { eventFieldSchemaInput } from './toFieldSchemaInput';

export function buildSchema(metadata: ProgramStageMetadata): z.ZodObject<z.ZodRawShape> {
    const shape: z.ZodRawShape = {};

    for (const psde of metadata.programStageDataElements ?? []) {
        const dataElementId = psde.dataElement?.id;
        if (!dataElementId) continue;
        shape[dataElementId] = buildFieldSchema(eventFieldSchemaInput(psde));
    }

    return z.object(shape);
}
