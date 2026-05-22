import { createEmptyFieldState, type FieldState, type FieldStateMap } from './types';

export type RuleEffect = {
    ruleActionType: string;
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

export type RuleEngineLike = {
    evaluate: (currentValues: Record<string, unknown>) => RuleEffect[];
};

const fieldKey = (effect: RuleEffect): string | undefined =>
    effect.ruleActionType === 'HIDESECTION'
        ? `section:${effect.programStageSection ?? effect.programSection ?? ''}`
        : (effect.dataElement ?? effect.trackedEntityAttribute ?? undefined);

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

    switch (effect.ruleActionType) {
        case 'HIDEFIELD':
            field.hidden = true;
            break;
        case 'SHOWFIELD':
            field.hidden = false;
            break;
        case 'SHOWWARNING':
            field.warning = effect.content ?? 'Warning';
            break;
        case 'SHOWERROR':
            field.error = effect.content ?? 'Error';
            break;
        case 'SETMANDATORYFIELD':
            field.mandatory = true;
            break;
        case 'UNSETMANDATORYFIELD':
            field.mandatory = false;
            break;
        case 'ASSIGN':
            field.assignedValue = effect.data ?? effect.content ?? null;
            break;
        case 'HIDEOPTION':
            if (effect.optionCode ?? effect.data) {
                field.hiddenOptions = new Set([
                    ...field.hiddenOptions,
                    String(effect.optionCode ?? effect.data),
                ]);
            }
            break;
        case 'SHOWOPTION':
            if (effect.optionCode ?? effect.data) {
                const optionToShow = String(effect.optionCode ?? effect.data);
                field.hiddenOptions = new Set(
                    [...field.hiddenOptions].filter((optionCode) => optionCode !== optionToShow)
                );
            }
            break;
        case 'HIDEOPTIONGROUP':
            if (effect.optionGroupId ?? effect.data) {
                field.hiddenOptionGroups = new Set([
                    ...field.hiddenOptionGroups,
                    String(effect.optionGroupId ?? effect.data),
                ]);
            }
            break;
        case 'SHOWOPTIONGROUP':
            if (effect.optionGroupId ?? effect.data) {
                const groupToShow = String(effect.optionGroupId ?? effect.data);
                field.hiddenOptionGroups = new Set(
                    [...field.hiddenOptionGroups].filter((groupId) => groupId !== groupToShow)
                );
            }
            break;
        case 'HIDESECTION':
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
    effectHandlers?: Partial<Record<string, EffectHandler>>
): FieldStateMap {
    const effects = engine.evaluate(currentValues);
    return effects.reduce<FieldStateMap>((state, effect) => {
        const custom = effectHandlers?.[effect.ruleActionType];
        return custom ? custom(effect, state) : applyEffect(state, effect);
    }, {});
}
