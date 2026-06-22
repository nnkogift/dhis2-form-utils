import type { FieldConfig } from './fieldConfig';

export type WidgetKind =
    | 'text'
    | 'longText'
    | 'number'
    | 'integer'
    | 'percentage'
    | 'email'
    | 'phone'
    | 'boolean'
    | 'trueOnly'
    | 'date'
    | 'datetime'
    | 'time'
    | 'age'
    | 'select'
    | 'orgUnit'
    | 'coordinate'
    | 'file'
    | 'image'
    | 'unsupported';

export function resolveWidgetKind(config: FieldConfig): WidgetKind {
    if (config.optionSet) return 'select';

    switch (config.valueType) {
        case 'TEXT':
        case 'LETTER':
        case 'URL':
        case 'USERNAME':
            return 'text';
        case 'LONG_TEXT':
        case 'MULTI_TEXT':
            return 'longText';
        case 'EMAIL':
            return 'email';
        case 'PHONE_NUMBER':
            return 'phone';
        case 'NUMBER':
        case 'UNIT_INTERVAL':
            return 'number';
        case 'INTEGER':
        case 'INTEGER_POSITIVE':
        case 'INTEGER_NEGATIVE':
        case 'INTEGER_ZERO_OR_POSITIVE':
            return 'integer';
        case 'PERCENTAGE':
            return 'percentage';
        case 'BOOLEAN':
            return 'boolean';
        case 'TRUE_ONLY':
            return 'trueOnly';
        case 'DATE':
            return 'date';
        case 'DATETIME':
            return 'datetime';
        case 'TIME':
            return 'time';
        case 'AGE':
            return 'age';
        case 'COORDINATE':
        case 'GEOJSON':
            return 'coordinate';
        case 'FILE_RESOURCE':
            return 'file';
        case 'IMAGE':
            return 'image';
        case 'ORGANISATION_UNIT':
            return 'orgUnit';
        case 'REFERENCE':
        default:
            return 'unsupported';
    }
}
