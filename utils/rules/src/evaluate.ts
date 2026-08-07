import { ProgramRuleActionType } from '@nnkogift/dhis2-form-utils-metadata';
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
    ruleId: string;
    ruleActionType: ProgramRuleActionType;
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
    effects: RuleEffect[];
};

const programRuleActionTypeValues = new Set<string>(Object.values(ProgramRuleActionType));

const isProgramRuleActionType = (value: ProgramRuleActionType): value is ProgramRuleActionType =>
    programRuleActionTypeValues.has(value);

const fieldKey = (effect: RuleEffect): string | undefined =>
    effect.dataElement ?? effect.trackedEntityAttribute ?? undefined;

const ensureField = (state: FieldStateMap, key: string): FieldState => {
    if (!(key in state)) {
        state[key] = createEmptyFieldState();
    }
    return state[key];
};

type EffectApplier = (field: FieldState, effect: RuleEffect) => void;

const applyHideField: EffectApplier = (field) => {
    field.hidden = true;
};

const applyShowField: EffectApplier = (field) => {
    field.hidden = false;
};

const applyShowWarning: EffectApplier = (field, effect) => {
    field.warning = effect.content ?? 'Warning';
};

const applyShowError: EffectApplier = (field, effect) => {
    field.error = effect.content ?? 'Error';
};

const applyWarningOnComplete: EffectApplier = (field, effect) => {
    field.warningOnComplete = effect.content ?? 'Warning';
};

const applyErrorOnComplete: EffectApplier = (field, effect) => {
    field.errorOnComplete = effect.content ?? 'Error';
};

const applySetMandatoryField: EffectApplier = (field) => {
    field.mandatory = true;
};

const applyUnsetMandatoryField: EffectApplier = (field) => {
    field.mandatory = false;
};

const applyAssign: EffectApplier = (field, effect) => {
    field.assignedValue = effect.data ?? effect.content ?? null;
};

const applyHideOption: EffectApplier = (field, effect) => {
    const optionCode = effect.optionCode ?? effect.data;
    if (!optionCode) return;
    field.hiddenOptions = new Set([...field.hiddenOptions, optionCode]);
};

const applyShowOption: EffectApplier = (field, effect) => {
    const optionCode = effect.optionCode ?? effect.data;
    if (!optionCode) return;
    field.hiddenOptions = new Set([...field.hiddenOptions].filter((code) => code !== optionCode));
};

const applyHideOptionGroup: EffectApplier = (field, effect) => {
    const optionGroupId = effect.optionGroupId ?? effect.data;
    if (!optionGroupId) return;
    field.hiddenOptionGroups = new Set([...field.hiddenOptionGroups, optionGroupId]);
};

const applyShowOptionGroup: EffectApplier = (field, effect) => {
    const optionGroupId = effect.optionGroupId ?? effect.data;
    if (!optionGroupId) return;
    field.hiddenOptionGroups = new Set(
        [...field.hiddenOptionGroups].filter((id) => id !== optionGroupId)
    );
};

const EFFECT_APPLIERS: Partial<Record<ProgramRuleActionType, EffectApplier>> = {
    [ProgramRuleActionType.HIDEFIELD]: applyHideField,
    [ProgramRuleActionType.SHOWFIELD]: applyShowField,
    [ProgramRuleActionType.SHOWWARNING]: applyShowWarning,
    [ProgramRuleActionType.SHOWERROR]: applyShowError,
    [ProgramRuleActionType.WARNINGONCOMPLETE]: applyWarningOnComplete,
    [ProgramRuleActionType.ERRORONCOMPLETE]: applyErrorOnComplete,
    [ProgramRuleActionType.SETMANDATORYFIELD]: applySetMandatoryField,
    [ProgramRuleActionType.UNSETMANDATORYFIELD]: applyUnsetMandatoryField,
    [ProgramRuleActionType.ASSIGN]: applyAssign,
    [ProgramRuleActionType.HIDEOPTION]: applyHideOption,
    [ProgramRuleActionType.SHOWOPTION]: applyShowOption,
    [ProgramRuleActionType.HIDEOPTIONGROUP]: applyHideOptionGroup,
    [ProgramRuleActionType.SHOWOPTIONGROUP]: applyShowOptionGroup,
};

export const applyEffect = (state: FieldStateMap, effect: RuleEffect): FieldStateMap => {
    const key = fieldKey(effect);
    if (!key) return state;

    const field = { ...ensureField(state, key) };
    const next = { ...state, [key]: field };

    const applier = isProgramRuleActionType(effect.ruleActionType)
        ? EFFECT_APPLIERS[effect.ruleActionType]
        : undefined;
    applier?.(field, effect);

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

    // SCHEDULEEVENT/CREATEEVENT effects have no field/section/feedback target — they fall into
    // partitionEffects' passthroughEffects and are only reachable here via effectHandlers.
    if (effectHandlers) {
        for (const effect of effects) {
            effectHandlers[effect.ruleActionType]?.(effect);
        }
    }

    return { fieldMap, sectionMap, feedback, effects };
}
