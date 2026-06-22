import { ProgramRuleActionType } from '@dhis2-form-utils/metadata';
import { partitionEffects } from './partitionEffects';
import { buildFeedbackMap, buildSectionMap } from './sectionFeedback';
import {
    createEmptyFieldState,
    type FieldState,
    type FieldStateMap,
    type FeedbackMap,
    type SectionStateMap,
} from './types';

/** Effect from rule-engine evaluation. Extend ProgramRuleActionType in metadata for new DHIS2 types. */
export type RuleEffect = {
    ruleActionType: ProgramRuleActionType | string;
    dataElement?: string | null;
    trackedEntityAttribute?: string | null;
    content?: string | null;
    data?: string | null;
    optionCode?: string | null;
    optionGroupId?: string | null;
    programStageSection?: string | null;
    programSection?: string | null;
    location?: string | null;
};

export type EffectHandler = (effect: RuleEffect) => void;

export type EffectHandlersMap = Partial<Record<ProgramRuleActionType, EffectHandler>> &
    Record<string, EffectHandler | undefined>;

export type RuleEngineLike = {
    evaluate: (currentValues: Record<string, unknown>) => RuleEffect[];
};

export type EvaluateAndMapResult = {
    fieldMap: FieldStateMap;
    sectionMap: SectionStateMap;
    feedback: FeedbackMap;
};

const programRuleActionTypeValues = new Set<string>(Object.values(ProgramRuleActionType));

const isProgramRuleActionType = (
    value: ProgramRuleActionType | string
): value is ProgramRuleActionType => programRuleActionTypeValues.has(value);

const fieldKey = (effect: RuleEffect): string | undefined =>
    effect.dataElement ?? effect.trackedEntityAttribute ?? undefined;

const ensureField = (state: FieldStateMap, key: string): FieldState => {
    if (!(key in state)) {
        state[key] = createEmptyFieldState();
    }
    return state[key];
};

export const applyEffect = (state: FieldStateMap, effect: RuleEffect): FieldStateMap => {
    const key = fieldKey(effect);
    if (!key) return state;

    const field = { ...ensureField(state, key) };
    const next = { ...state, [key]: field };

    const actionType = effect.ruleActionType;
    if (!isProgramRuleActionType(actionType)) {
        return next;
    }

    switch (actionType) {
        case ProgramRuleActionType.HIDEFIELD:
            field.hidden = true;
            break;
        case ProgramRuleActionType.SHOWFIELD:
            field.hidden = false;
            break;
        case ProgramRuleActionType.SHOWWARNING:
            field.warning = effect.content ?? 'Warning';
            break;
        case ProgramRuleActionType.SHOWERROR:
            field.error = effect.content ?? 'Error';
            break;
        case ProgramRuleActionType.WARNINGONCOMPLETE:
            field.warningOnComplete = effect.content ?? 'Warning';
            break;
        case ProgramRuleActionType.ERRORONCOMPLETE:
            field.errorOnComplete = effect.content ?? 'Error';
            break;
        case ProgramRuleActionType.SETMANDATORYFIELD:
            field.mandatory = true;
            break;
        case ProgramRuleActionType.UNSETMANDATORYFIELD:
            field.mandatory = false;
            break;
        case ProgramRuleActionType.ASSIGN:
            field.assignedValue = effect.data ?? effect.content ?? null;
            break;
        case ProgramRuleActionType.HIDEOPTION:
            if (effect.optionCode ?? effect.data) {
                field.hiddenOptions = new Set([
                    ...field.hiddenOptions,
                    String(effect.optionCode ?? effect.data),
                ]);
            }
            break;
        case ProgramRuleActionType.SHOWOPTION:
            if (effect.optionCode ?? effect.data) {
                const optionToShow = String(effect.optionCode ?? effect.data);
                field.hiddenOptions = new Set(
                    [...field.hiddenOptions].filter((optionCode) => optionCode !== optionToShow)
                );
            }
            break;
        case ProgramRuleActionType.HIDEOPTIONGROUP:
            if (effect.optionGroupId ?? effect.data) {
                field.hiddenOptionGroups = new Set([
                    ...field.hiddenOptionGroups,
                    String(effect.optionGroupId ?? effect.data),
                ]);
            }
            break;
        case ProgramRuleActionType.SHOWOPTIONGROUP:
            if (effect.optionGroupId ?? effect.data) {
                const groupToShow = String(effect.optionGroupId ?? effect.data);
                field.hiddenOptionGroups = new Set(
                    [...field.hiddenOptionGroups].filter((groupId) => groupId !== groupToShow)
                );
            }
            break;
        default:
            break;
    }

    return next;
};

export function buildFieldMap(effects: RuleEffect[]): FieldStateMap {
    return effects.reduce<FieldStateMap>((state, effect) => applyEffect(state, effect), {});
}

export function evaluateAndMap(
    engine: RuleEngineLike,
    currentValues: Record<string, unknown>,
    effectHandlers?: EffectHandlersMap
): EvaluateAndMapResult {
    const effects = engine.evaluate(currentValues);
    const { fieldEffects, sectionEffects, feedbackEffects } = partitionEffects(effects);

    const fieldMap = buildFieldMap(fieldEffects);
    const sectionMap = buildSectionMap(sectionEffects);
    const feedback = buildFeedbackMap(feedbackEffects);

    if (effectHandlers) {
        for (const effect of effects) {
            effectHandlers[effect.ruleActionType]?.(effect);
        }
    }

    return { fieldMap, sectionMap, feedback };
}
