import { ProgramRuleActionType } from '@dhis2-form-utils/metadata';
import { createEmptyFieldState, type FieldState, type FieldStateMap } from './types';

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
};

export type EffectHandler = (effect: RuleEffect, state: FieldStateMap) => FieldStateMap;

export type EffectHandlersMap = Partial<Record<ProgramRuleActionType, EffectHandler>> &
    Record<string, EffectHandler | undefined>;

export type RuleEngineLike = {
    evaluate: (currentValues: Record<string, unknown>) => RuleEffect[];
};

const programRuleActionTypeValues = new Set<string>(Object.values(ProgramRuleActionType));

const isProgramRuleActionType = (
    value: ProgramRuleActionType | string
): value is ProgramRuleActionType => programRuleActionTypeValues.has(value);

const fieldKey = (effect: RuleEffect): string | undefined => {
    if (
        isProgramRuleActionType(effect.ruleActionType) &&
        effect.ruleActionType === ProgramRuleActionType.HIDESECTION
    ) {
        return `section:${effect.programStageSection ?? effect.programSection ?? ''}`;
    }

    return effect.dataElement ?? effect.trackedEntityAttribute ?? undefined;
};

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
        case ProgramRuleActionType.HIDESECTION:
            field.hidden = true;
            field.hiddenSections = new Set([
                ...field.hiddenSections,
                effect.programStageSection ?? effect.programSection ?? key.replace('section:', ''),
            ]);
            break;
        default:
            break;
    }

    return next;
};

export function evaluateAndMap(
    engine: RuleEngineLike,
    currentValues: Record<string, unknown>,
    effectHandlers?: EffectHandlersMap,
    _ruleFilter?: Set<string>
): FieldStateMap {
    const effects = engine.evaluate(currentValues);
    return effects.reduce<FieldStateMap>((state, effect) => {
        const custom = effectHandlers?.[effect.ruleActionType];
        return custom ? custom(effect, state) : applyEffect(state, effect);
    }, {});
}
