import { createEmptyFieldState, type FieldState, type FieldStateMap } from './types';

/** Simplified rule effect shape for stub evaluation (mirrors @dhis2/rule-engine RuleEffect). */
export type RuleEffect = {
  ruleActionType: string;
  dataElement?: string;
  trackedEntityAttribute?: string;
  content?: string;
  data?: string;
};

export type EffectHandler = (effect: RuleEffect, state: FieldStateMap) => FieldStateMap;

export type RuleEngineLike = {
  evaluate: (currentValues: Record<string, unknown>) => RuleEffect[];
};

const fieldKey = (effect: RuleEffect): string | undefined =>
  effect.dataElement ?? effect.trackedEntityAttribute;

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
    case 'SHOWWARNING':
      field.warning = effect.content ?? 'Warning';
      break;
    case 'SHOWERROR':
      field.error = effect.content ?? 'Error';
      break;
    case 'SETMANDATORYFIELD':
      field.mandatory = true;
      break;
    case 'ASSIGN':
      field.assignedValue = effect.data ?? effect.content ?? null;
      break;
    case 'HIDEOPTION':
      if (effect.data) {
        field.hiddenOptions = new Set([...field.hiddenOptions, effect.data]);
      }
      break;
    case 'HIDEOPTIONGROUP':
      if (effect.data) {
        field.hiddenOptionGroups = new Set([...field.hiddenOptionGroups, effect.data]);
      }
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
