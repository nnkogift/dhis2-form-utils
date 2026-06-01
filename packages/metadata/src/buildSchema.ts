import { z } from 'zod';
import { Dhis2ValueType } from './enums';
import type { ProgramStageMetadata } from './types';

const valueTypeToZod = (valueType: Dhis2ValueType): z.ZodTypeAny => {
    switch (valueType) {
        case Dhis2ValueType.TEXT:
        case Dhis2ValueType.LONG_TEXT:
            return z.string();
        case Dhis2ValueType.INTEGER:
        case Dhis2ValueType.INTEGER_POSITIVE:
            return z.coerce.number().int();
        case Dhis2ValueType.NUMBER:
            return z.coerce.number();
        case Dhis2ValueType.BOOLEAN:
            return z.coerce.boolean();
        case Dhis2ValueType.DATE:
            return z.string().date();
        case Dhis2ValueType.ORGANISATION_UNIT:
            return z.string().min(11).max(11);
        case Dhis2ValueType.FILE_RESOURCE:
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
