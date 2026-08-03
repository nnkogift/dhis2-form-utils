import { ProgramRuleActionType } from '@dhis2-form-utils/metadata';
import type { RuleEffect } from './evaluate';

const FIELD_SCOPED_TYPES = new Set<string>([
    ProgramRuleActionType.HIDEFIELD,
    ProgramRuleActionType.SHOWFIELD,
    ProgramRuleActionType.SHOWWARNING,
    ProgramRuleActionType.SHOWERROR,
    ProgramRuleActionType.WARNINGONCOMPLETE,
    ProgramRuleActionType.ERRORONCOMPLETE,
    ProgramRuleActionType.ASSIGN,
    ProgramRuleActionType.SETMANDATORYFIELD,
    ProgramRuleActionType.UNSETMANDATORYFIELD,
    ProgramRuleActionType.HIDEOPTION,
    ProgramRuleActionType.HIDEOPTIONGROUP,
    ProgramRuleActionType.SHOWOPTION,
    ProgramRuleActionType.SHOWOPTIONGROUP,
]);

export type PartitionedEffects = {
    fieldEffects: RuleEffect[];
    sectionEffects: RuleEffect[];
    feedbackEffects: RuleEffect[];
    passthroughEffects: RuleEffect[];
};

export function partitionEffects(effects: RuleEffect[]): PartitionedEffects {
    const fieldEffects: RuleEffect[] = [];
    const sectionEffects: RuleEffect[] = [];
    const feedbackEffects: RuleEffect[] = [];
    const passthroughEffects: RuleEffect[] = [];

    for (const effect of effects) {
        if (FIELD_SCOPED_TYPES.has(effect.ruleActionType)) {
            fieldEffects.push(effect);
        } else if (effect.ruleActionType === 'HIDESECTION') {
            sectionEffects.push(effect);
        } else if (
            effect.ruleActionType === 'DISPLAYTEXT' ||
            effect.ruleActionType === 'DISPLAYKEYVALUEPAIR'
        ) {
            feedbackEffects.push(effect);
        } else {
            passthroughEffects.push(effect);
        }
    }

    return { fieldEffects, sectionEffects, feedbackEffects, passthroughEffects };
}
