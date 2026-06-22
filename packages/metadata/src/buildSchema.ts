import type { ValueType } from '@dhis2/api-types/v43';
import { z } from 'zod';
import type { ProgramStageMetadata } from './types';

const valueTypeToZod = (valueType: ValueType | undefined): z.ZodTypeAny => {
    switch (valueType) {
        case 'TEXT':
        case 'LONG_TEXT':
        case 'MULTI_TEXT':
        case 'LETTER':
        case 'PHONE_NUMBER':
        case 'EMAIL':
        case 'URL':
        case 'USERNAME':
        case 'TIME':
        case 'COORDINATE':
        case 'AGE':
        case 'GEOJSON':
            return z.string();
        case 'INTEGER':
        case 'INTEGER_POSITIVE':
        case 'INTEGER_NEGATIVE':
        case 'INTEGER_ZERO_OR_POSITIVE':
            return z.coerce.number().int();
        case 'NUMBER':
        case 'UNIT_INTERVAL':
        case 'PERCENTAGE':
            return z.coerce.number();
        case 'BOOLEAN':
        case 'TRUE_ONLY':
            return z.coerce.boolean();
        case 'DATE':
        case 'DATETIME':
            return z.string().date();
        case 'ORGANISATION_UNIT':
            return z.string().min(11).max(11);
        case 'FILE_RESOURCE':
        case 'IMAGE':
            return z.string().uuid();
        case 'REFERENCE':
        default:
            return z.string();
    }
};

export function buildSchema(metadata: ProgramStageMetadata): z.ZodObject<z.ZodRawShape> {
    const shape: z.ZodRawShape = {};

    for (const psde of metadata.programStageDataElements ?? []) {
        const dataElement = psde.dataElement;
        if (!dataElement?.id) continue;
        shape[dataElement.id] = valueTypeToZod(dataElement.valueType);
    }

    return z.object(shape);
}
