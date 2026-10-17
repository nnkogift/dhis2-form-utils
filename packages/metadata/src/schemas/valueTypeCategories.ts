import type { ValueType } from '@dhis2/api-types/v43';

const INTEGER_VALUE_TYPES: readonly ValueType[] = [
    'INTEGER',
    'INTEGER_POSITIVE',
    'INTEGER_NEGATIVE',
    'INTEGER_ZERO_OR_POSITIVE',
];
const DECIMAL_VALUE_TYPES: readonly ValueType[] = ['NUMBER', 'UNIT_INTERVAL', 'PERCENTAGE'];
const BOOLEAN_VALUE_TYPES: readonly ValueType[] = ['BOOLEAN', 'TRUE_ONLY'];
const DATE_VALUE_TYPES: readonly ValueType[] = ['DATE', 'DATETIME'];

const isIntegerValueType = (valueType?: ValueType): boolean =>
    valueType !== undefined && INTEGER_VALUE_TYPES.includes(valueType);

export const isNumericValueType = (valueType?: ValueType): boolean =>
    isIntegerValueType(valueType) ||
    (valueType !== undefined && DECIMAL_VALUE_TYPES.includes(valueType));

const isBooleanValueType = (valueType?: ValueType): boolean =>
    valueType !== undefined && BOOLEAN_VALUE_TYPES.includes(valueType);

export const isDateValueType = (valueType?: ValueType): boolean =>
    valueType !== undefined && DATE_VALUE_TYPES.includes(valueType);

/** Parses a validated, non-empty form string into the specific type of its value type. */
export const toTypedValue = (
    valueType: ValueType | undefined,
    value: string
): string | number | boolean => {
    if (isNumericValueType(valueType)) return Number(value);
    if (isBooleanValueType(valueType)) return value === 'true';
    return value;
};
