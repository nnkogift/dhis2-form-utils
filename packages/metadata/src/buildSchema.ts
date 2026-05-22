import { z } from 'zod';
import type { Dhis2ValueType, ProgramStageMetadata } from './types';

const valueTypeToZod = (valueType: Dhis2ValueType): z.ZodTypeAny => {
    switch (valueType) {
        case 'TEXT':
        case 'LONG_TEXT':
            return z.string();
        case 'INTEGER':
        case 'INTEGER_POSITIVE':
            return z.coerce.number().int();
        case 'NUMBER':
            return z.coerce.number();
        case 'BOOLEAN':
            return z.coerce.boolean();
        case 'DATE':
            return z.string().date();
        case 'ORGANISATION_UNIT':
            return z.string().min(11).max(11);
        case 'FILE_RESOURCE':
            return z.string().uuid();
        default:
            return z.unknown();
    }
};

export function buildSchema(metadata: ProgramStageMetadata): z.ZodObject<z.ZodRawShape> {
    const shape: z.ZodRawShape = {};

    for (const { dataElement } of metadata.programStageDataElements) {
        shape[dataElement.id] = valueTypeToZod(dataElement.valueType);
    }

    return z.object(shape);
}
