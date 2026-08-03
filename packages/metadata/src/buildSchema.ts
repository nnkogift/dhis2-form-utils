import type { ValueType } from '@dhis2/api-types/v43';
import { z } from 'zod';
import type { ProgramStageMetadata } from './types';

const STRING_VALUE_TYPES: ValueType[] = [
    'TEXT',
    'LONG_TEXT',
    'MULTI_TEXT',
    'LETTER',
    'PHONE_NUMBER',
    'EMAIL',
    'URL',
    'USERNAME',
    'TIME',
    'COORDINATE',
    'AGE',
    'GEOJSON',
];
const INTEGER_VALUE_TYPES: ValueType[] = [
    'INTEGER',
    'INTEGER_POSITIVE',
    'INTEGER_NEGATIVE',
    'INTEGER_ZERO_OR_POSITIVE',
];
const DECIMAL_VALUE_TYPES: ValueType[] = ['NUMBER', 'UNIT_INTERVAL', 'PERCENTAGE'];
const BOOLEAN_VALUE_TYPES: ValueType[] = ['BOOLEAN', 'TRUE_ONLY'];
const DATE_VALUE_TYPES: ValueType[] = ['DATE', 'DATETIME'];
const UUID_VALUE_TYPES: ValueType[] = ['FILE_RESOURCE', 'IMAGE'];

const STRING_SCHEMA = z.string();
const INTEGER_SCHEMA = z.coerce.number().int();
const DECIMAL_SCHEMA = z.coerce.number();
const BOOLEAN_SCHEMA = z.coerce.boolean();
const DATE_SCHEMA = z.string().date();
const ORGANISATION_UNIT_SCHEMA = z.string().min(11).max(11);
const UUID_SCHEMA = z.string().uuid();

const VALUE_TYPE_ZOD_SCHEMA = new Map<ValueType, z.ZodTypeAny>([
    ...STRING_VALUE_TYPES.map((valueType) => [valueType, STRING_SCHEMA] as const),
    ...INTEGER_VALUE_TYPES.map((valueType) => [valueType, INTEGER_SCHEMA] as const),
    ...DECIMAL_VALUE_TYPES.map((valueType) => [valueType, DECIMAL_SCHEMA] as const),
    ...BOOLEAN_VALUE_TYPES.map((valueType) => [valueType, BOOLEAN_SCHEMA] as const),
    ...DATE_VALUE_TYPES.map((valueType) => [valueType, DATE_SCHEMA] as const),
    ['ORGANISATION_UNIT', ORGANISATION_UNIT_SCHEMA],
    ...UUID_VALUE_TYPES.map((valueType) => [valueType, UUID_SCHEMA] as const),
]);

const valueTypeToZod = (valueType: ValueType | undefined): z.ZodTypeAny =>
    (valueType && VALUE_TYPE_ZOD_SCHEMA.get(valueType)) || STRING_SCHEMA;

export function buildSchema(metadata: ProgramStageMetadata): z.ZodObject<z.ZodRawShape> {
    const shape: z.ZodRawShape = {};

    for (const psde of metadata.programStageDataElements ?? []) {
        const dataElement = psde.dataElement;
        if (!dataElement?.id) continue;
        shape[dataElement.id] = valueTypeToZod(dataElement.valueType);
    }

    return z.object(shape);
}
