/* eslint-disable @typescript-eslint/no-deprecated -- @dhis2/rule-engine Kotlin/JS interop requires these APIs */
import { RuleValueType } from '@dhis2/rule-engine';

export const ruleValueTypeFromDhis2 = (valueType?: string): RuleValueType => {
    switch (valueType) {
        case 'NUMBER':
        case 'INTEGER':
        case 'INTEGER_POSITIVE':
        case 'INTEGER_NEGATIVE':
        case 'INTEGER_ZERO_OR_POSITIVE':
        case 'UNIT_INTERVAL':
        case 'PERCENTAGE':
            return RuleValueType.NUMERIC;
        case 'BOOLEAN':
        case 'TRUE_ONLY':
            return RuleValueType.BOOLEAN;
        case 'DATE':
        case 'DATETIME':
        case 'AGE':
            return RuleValueType.DATE;
        default:
            return RuleValueType.TEXT;
    }
};
