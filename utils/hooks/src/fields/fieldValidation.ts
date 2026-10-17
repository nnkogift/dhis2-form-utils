import { buildFieldSchema as buildMetadataFieldSchema } from '@nnkogift/dhis2-form-utils-metadata';
import type { z } from 'zod';
import type { FieldConfig } from './fieldConfig';

/**
 * Per-field Zod schema for a resolved `FieldConfig`. Thin adapter over the metadata package's
 * `buildFieldSchema`, which is the single source of truth for value-type validation.
 * Input is the flat string held in React Hook Form; output is the typed value.
 */
export function buildFieldSchema(config: FieldConfig): z.ZodTypeAny {
    return buildMetadataFieldSchema({
        valueType: config.valueType,
        // A server-generated attribute is filled on save, so it is never client-required.
        required: config.required && !config.generated,
        allowFutureDate: config.allowFutureDate,
        optionCodes: config.optionSet?.options.map((option) => option.code),
        bounds: config.bounds,
    });
}
